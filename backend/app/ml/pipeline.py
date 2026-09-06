"""Prediction service: orchestrates text preprocessing and model inference."""

import json
import logging
from pathlib import Path
from typing import Any, Optional

from app.core.config import settings
from app.ml.trainer import BaselineTrainer
from app.nlp.text_cleaner import SafetyKeywordExtractor, TextCleaner

logger = logging.getLogger(__name__)


class PredictionService:
    """Unified prediction interface for the ML system."""

    def __init__(self):
        self.cleaner = TextCleaner()
        self.keyword_extractor = SafetyKeywordExtractor()
        self.model: Optional[BaselineTrainer] = None
        self.model_name: str = "baseline"
        self.model_version: str = "1.0.0"
        self._loaded = False

    def load_model(self, model_dir: str | None = None) -> bool:
        """Load the trained model from disk."""
        model_dir = model_dir or settings.MODEL_PATH
        path = Path(model_dir)

        config_file = path / "model_config.json"
        if not config_file.exists():
            logger.warning("No model config found at %s", config_file)
            return False

        try:
            self.model = BaselineTrainer.load(str(path))
            with open(config_file) as f:
                config = json.load(f)
            self.model_name = config.get("model_type", "baseline")
            self.model_version = config.get("model_version", "1.0.0")
            self._loaded = True
            logger.info("Loaded model: %s v%s", self.model_name, self.model_version)
            return True
        except Exception as e:
            logger.error("Failed to load model: %s", e)
            return False

    @property
    def is_loaded(self) -> bool:
        return self._loaded and self.model is not None

    def analyze(self, report_text: str) -> dict[str, Any]:
        """Full analysis pipeline for a safety report."""
        cleaned_text = self.cleaner.clean(report_text)
        hazards = self.keyword_extractor.extract_hazards(cleaned_text)
        missing_controls_raw = self.keyword_extractor.extract_missing_controls(cleaned_text)
        important_phrases = self.keyword_extractor.extract_phrases(cleaned_text)

        if self.is_loaded:
            prediction = self._model_predict(cleaned_text)
        else:
            prediction = self._rule_based_predict(cleaned_text, hazards)

        risk_level = prediction["risk_level"]
        confidence = prediction["confidence"]

        precursor_categories = prediction.get("precursors", [])
        if not precursor_categories and hazards:
            precursor_categories = [{"name": h, "confidence": 0.7} for h in hazards]

        missing_controls = self._build_missing_controls(missing_controls_raw, hazards)

        review_priority = self._compute_priority(risk_level, confidence, hazards)

        explanation = self._generate_explanation(
            risk_level, confidence, precursor_categories,
            missing_controls, important_phrases, hazards,
        )

        return {
            "risk_level": risk_level,
            "confidence_score": confidence,
            "review_priority": review_priority,
            "detected_precursors": precursor_categories,
            "detected_hazards": hazards,
            "missing_controls": missing_controls,
            "explanation": explanation,
            "important_phrases": important_phrases,
        }

    def _model_predict(self, text: str) -> dict[str, Any]:
        try:
            proba = self.model.predict_proba([text])[0]
            classes = self.model.get_class_labels()
            pred_idx = int(proba.argmax())
            risk_level = classes[pred_idx]
            confidence = float(proba[pred_idx])

            return {
                "risk_level": risk_level,
                "confidence": confidence,
                "precursors": [],
            }
        except Exception as e:
            logger.error("Model prediction failed: %s", e)
            return {"risk_level": "MEDIUM", "confidence": 0.5, "precursors": []}

    def _rule_based_predict(
        self, text: str, hazards: list[str]
    ) -> dict[str, Any]:
        text_lower = text.lower()
        score = 0.0

        high_risk_terms = [
            "without", "failed to", "did not", "no permit", "no isolation",
            "confined space", "live electrical", "working at height",
            "without harness", "no gas testing", "disabled",
        ]
        medium_risk_terms = [
            "forgot", "minor", "slight", "temporary", "small",
        ]

        for term in high_risk_terms:
            if term in text_lower:
                score += 0.2

        for term in medium_risk_terms:
            if term in text_lower:
                score += 0.1

        score += len(hazards) * 0.15
        score = min(score, 1.0)

        if score >= 0.6:
            risk_level = "HIGH"
        elif score >= 0.3:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return {
            "risk_level": risk_level,
            "confidence": round(score, 4),
            "precursors": [{"name": h, "confidence": 0.6} for h in hazards[:3]],
        }

    def _build_missing_controls(
        self, raw_controls: list[str], hazards: list[str]
    ) -> list[dict[str, str]]:
        controls = []
        seen = set()
        for ctrl in raw_controls[:5]:
            if ctrl not in seen:
                controls.append({"control": ctrl.title(), "category": "inferred"})
                seen.add(ctrl)

        if not controls:
            for hazard in hazards[:2]:
                controls.append({
                    "control": f"Review {hazard.replace('_', ' ')} controls",
                    "category": "recommended",
                })

        return controls

    def _compute_priority(
        self, risk_level: str, confidence: float, hazards: list[str]
    ) -> int:
        base = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}.get(risk_level, 1)
        if confidence > 0.8:
            base += 1
        if len(hazards) >= 3:
            base += 1
        return min(base, 5)

    def _generate_explanation(
        self,
        risk_level: str,
        confidence: float,
        precursors: list[dict],
        missing_controls: list[dict],
        important_phrases: list[str],
        hazards: list[str],
    ) -> str:
        parts = []
        parts.append(
            f"This report was classified as {risk_level} risk "
            f"with {confidence:.0%} confidence."
        )

        if precursors:
            names = [p["name"] for p in precursors[:3]]
            parts.append(f"Detected SIF precursors: {', '.join(names)}.")

        if hazards:
            parts.append(f"Hazard types identified: {', '.join(hazards)}.")

        if missing_controls:
            ctrl_names = [c["control"] for c in missing_controls[:3]]
            parts.append(f"Missing or weak controls: {', '.join(ctrl_names)}.")

        if risk_level == "HIGH":
            parts.append("HIGH PRIORITY: This report describes conditions with significant SIF potential. Immediate human review recommended.")
        elif risk_level == "MEDIUM":
            parts.append("MEDIUM priority: This report indicates control gaps that should be reviewed by the safety team.")

        return " ".join(parts)


prediction_service = PredictionService()
