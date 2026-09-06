"""Keyword-based fallback explainer — always works, no ML dependencies."""

from typing import Any

from app.nlp.text_cleaner import SafetyKeywordExtractor, SAFETY_ABBREVIATIONS


class KeywordExplainer:
    """Explain using safety keyword detection. Always available."""

    RISK_INDICATORS = {
        "high": [
            "without", "failed to", "did not", "no permit", "no isolation",
            "confined space", "live electrical", "working at height",
            "without harness", "no gas testing", "disabled", "bypassed",
            "overloaded", "unsecured", "unauthorized", "improper",
        ],
        "medium": [
            "forgot", "minor", "slight", "temporary", "small",
            "intermittent", "partial", "delayed",
        ],
        "low": [
            "reported", "noticed", "inspected", "found", "observed",
            "corrected", "replaced", "maintained",
        ],
    }

    def __init__(self):
        self.keyword_extractor = SafetyKeywordExtractor()

    def explain(self, text: str, top_k: int = 10) -> dict[str, Any]:
        """Generate keyword-based explanation."""
        text_lower = text.lower()
        hazards = self.keyword_extractor.extract_hazards(text)
        phrases = self.keyword_extractor.extract_phrases(text, top_k=top_k)
        missing_controls = self.keyword_extractor.extract_missing_controls(text)

        risk_scores = {}
        for level, terms in self.RISK_INDICATORS.items():
            score = sum(1 for term in terms if term in text_lower)
            if score > 0:
                risk_scores[level] = score

        important_features = []
        for hazard in hazards:
            important_features.append({
                "feature": hazard.replace("_", " ").title(),
                "value": 0.7,
                "direction": "increases risk",
                "category": "hazard_type",
            })

        for ctrl in missing_controls[:3]:
            important_features.append({
                "feature": ctrl.title(),
                "value": 0.6,
                "direction": "increases risk",
                "category": "missing_control",
            })

        for phrase in phrases[:2]:
            important_features.append({
                "feature": phrase,
                "value": 0.5,
                "direction": "increases risk",
                "category": "evidence_phrase",
            })

        absence_terms = ["without", "no ", "did not", "failed to", "lack", "absence", "forgot", "not in place"]
        for term in absence_terms:
            if term in text_lower and len(important_features) < top_k:
                important_features.append({
                    "feature": f'Absence indicator: "{term}"',
                    "value": 0.4,
                    "direction": "increases risk",
                    "category": "absence_indicator",
                })

        explanation = self._build_narrative(text, hazards, missing_controls, risk_scores)

        return {
            "method": "keyword",
            "important_features": important_features[:top_k],
            "explanation": explanation,
            "detected_hazards": hazards,
            "missing_controls": missing_controls,
            "risk_signals": risk_scores,
        }

    def _build_narrative(
        self,
        text: str,
        hazards: list[str],
        missing_controls: list[str],
        risk_scores: dict[str, int],
    ) -> str:
        parts = []

        if hazards:
            hazard_names = [h.replace("_", " ") for h in hazards]
            parts.append(f"This report involves {', '.join(hazard_names)} hazards.")

        if missing_controls:
            parts.append(f"Missing or inadequate controls: {', '.join(missing_controls[:3])}.")

        text_lower = text.lower()
        absence_terms = ["without", "no ", "did not", "failed to", "lack", "absence"]
        absence_count = sum(1 for t in absence_terms if t in text_lower)
        if absence_count > 0:
            parts.append(f"The report contains {absence_count} absence/negation indicator(s) suggesting control gaps.")

        if risk_scores.get("high", 0) > 0:
            parts.append("HIGH risk signals detected: conditions described have significant SIF potential.")
        elif risk_scores.get("medium", 0) > 0:
            parts.append("MEDIUM risk signals detected: some control weaknesses noted.")
        else:
            parts.append("Risk indicators are within normal reporting range.")

        parts.append("Note: This analysis is AI-assisted and requires human review for final safety decisions.")

        return " ".join(parts)
