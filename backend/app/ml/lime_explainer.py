"""LIME-based explainer for text classification."""

import logging
from typing import Any

logger = logging.getLogger(__name__)


class LIMEExplainer:
    """Explain predictions using LIME for text models."""

    def __init__(self, predict_fn, class_labels: list[str]):
        self.predict_fn = predict_fn
        self.class_labels = class_labels
        self._explainer = None

    def _get_explainer(self):
        if self._explainer is None:
            try:
                from lime.lime_text import LimeTextExplainer
                self._explainer = LimeTextExplainer(class_names=self.class_labels)
            except Exception as e:
                logger.warning("Failed to create LIME explainer: %s", e)
                return None
        return self._explainer

    def explain(self, text: str, top_k: int = 10, num_samples: int = 100) -> dict[str, Any]:
        """Generate LIME explanation for a single text."""
        explainer = self._get_explainer()
        if explainer is None:
            return self._fallback_explain(text)

        try:
            def predict_wrapper(texts):
                results = []
                for t in texts:
                    probs = self.predict_fn(t)
                    results.append(probs)
                return results

            explanation = explainer.explain_instance(
                text,
                predict_wrapper,
                num_features=top_k,
                num_samples=num_samples,
            )

            pred_class = explanation.available_labels()[0] if explanation.available_labels() else 0
            word_importance = explanation.as_list(label=pred_class)

            important_features = []
            for word, weight in word_importance:
                important_features.append({
                    "feature": word,
                    "value": float(weight),
                    "direction": "increases risk" if weight > 0 else "decreases risk",
                })

            return {
                "method": "lime",
                "important_features": important_features,
                "explanation": self._format_lime_explanation(important_features),
                "predicted_class": self.class_labels[pred_class] if pred_class < len(self.class_labels) else str(pred_class),
            }
        except Exception as e:
            logger.warning("LIME explanation failed: %s", e)
            return self._fallback_explain(text)

    def _format_lime_explanation(self, features: list[dict]) -> str:
        if not features:
            return "No significant features detected."
        parts = ["LIME analysis of this report:"]
        for f in features[:5]:
            direction = "increases" if "increases" in f["direction"] else "decreases"
            parts.append(f'  - "{f["feature"]}" {direction} risk (weight: {abs(f["value"]):.4f})')
        return "\n".join(parts)

    def _fallback_explain(self, text: str) -> dict[str, Any]:
        from app.nlp.text_cleaner import SafetyKeywordExtractor
        extractor = SafetyKeywordExtractor()
        hazards = extractor.extract_hazards(text)
        features = [{"feature": h, "value": 0.5, "direction": "increases risk"} for h in hazards]
        return {
            "method": "keyword_fallback",
            "important_features": features,
            "explanation": f"Detected hazards: {', '.join(hazards)}",
        }
