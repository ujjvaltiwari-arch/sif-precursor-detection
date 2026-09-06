"""SHAP-based explainer for the baseline TF-IDF + Logistic Regression model."""

import logging
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


class SHAPExplainer:
    """Explain predictions using SHAP for the baseline model."""

    def __init__(self, model, feature_extractor, class_labels: list[str]):
        self.model = model
        self.feature_extractor = feature_extractor
        self.class_labels = class_labels
        self._explainer = None

    def _get_explainer(self):
        if self._explainer is None:
            try:
                import shap
                background = self.feature_extractor.transform([
                    "worker safety hazard confined space permit",
                    "electrical work LOTO isolation near chemicals",
                    "routine inspection completed safely",
                ])
                masker = shap.maskers.Independent(background)
                self._explainer = shap.LinearExplainer(
                    self.model,
                    masker,
                    feature_names=self.feature_extractor.get_feature_names_out(),
                )
            except Exception as e:
                logger.warning("Failed to create SHAP explainer: %s", e)
                return None
        return self._explainer

    def explain(self, text: str, top_k: int = 10) -> dict[str, Any]:
        """Generate SHAP explanation for a single text."""
        explainer = self._get_explainer()
        if explainer is None:
            return self._fallback_explain(text, top_k)

        try:
            X = self.feature_extractor.transform([text])
            shap_values = explainer.shap_values(X)

            feature_names = self.feature_extractor.get_feature_names_out()

            if isinstance(shap_values, list):
                pred_idx = self.model.predict([text])[0]
                class_idx = self.class_labels.index(pred_idx) if pred_idx in self.class_labels else 0
                values = shap_values[class_idx]
            else:
                values = shap_values

            if hasattr(values, "toarray"):
                values = values.toarray().flatten()
            elif hasattr(values, "flatten"):
                values = values.flatten()

            top_indices = np.argsort(np.abs(values))[-top_k:][::-1]
            important_features = []
            for idx in top_indices:
                if idx < len(feature_names) and values[idx] != 0:
                    important_features.append({
                        "feature": feature_names[idx],
                        "value": float(values[idx]),
                        "direction": "increases risk" if values[idx] > 0 else "decreases risk",
                    })

            return {
                "method": "shap",
                "important_features": important_features,
                "explanation": self._format_shap_explanation(important_features),
            }
        except Exception as e:
            logger.warning("SHAP explanation failed: %s", e)
            return self._fallback_explain(text, top_k)

    def _format_shap_explanation(self, features: list[dict]) -> str:
        if not features:
            return "No significant features detected."
        parts = ["Key factors in this prediction:"]
        for f in features[:5]:
            direction = "increases" if "increases" in f["direction"] else "decreases"
            parts.append(f'  - "{f["feature"]}" {direction} risk (impact: {abs(f["value"]):.4f})')
        return "\n".join(parts)

    def _fallback_explain(self, text: str, top_k: int) -> dict[str, Any]:
        from app.nlp.text_cleaner import SafetyKeywordExtractor
        extractor = SafetyKeywordExtractor()
        hazards = extractor.extract_hazards(text)
        phrases = extractor.extract_phrases(text, top_k=top_k)
        features = [{"feature": h, "value": 0.5, "direction": "increases risk"} for h in hazards]
        return {
            "method": "keyword_fallback",
            "important_features": features,
            "explanation": f"Detected hazards: {', '.join(hazards)}. Important phrases: {'; '.join(phrases[:3])}",
        }
