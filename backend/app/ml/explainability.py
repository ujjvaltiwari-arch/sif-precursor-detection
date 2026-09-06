"""Unified explainability service that selects the best available method."""

import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


class ExplainabilityService:
    """Unified interface for report explanation."""

    def __init__(self):
        self._shap_explainer = None
        self._lime_explainer = None
        self._keyword_explainer = None

    def initialize(
        self,
        model=None,
        feature_extractor=None,
        class_labels: list[str] | None = None,
    ) -> None:
        """Initialize explainers based on available resources."""
        if model is not None and feature_extractor is not None and class_labels:
            try:
                from app.ml.shap_explainer import SHAPExplainer
                self._shap_explainer = SHAPExplainer(model, feature_extractor, class_labels)
                logger.info("SHAP explainer initialized")
            except Exception as e:
                logger.warning("Could not initialize SHAP: %s", e)

        from app.ml.keyword_explainer import KeywordExplainer
        self._keyword_explainer = KeywordExplainer()
        logger.info("Keyword explainer initialized")

    def explain(
        self,
        text: str,
        risk_level: str = "MEDIUM",
        confidence: float = 0.5,
        detected_hazards: list[str] | None = None,
        missing_controls: list[dict] | None = None,
        top_k: int = 10,
    ) -> dict[str, Any]:
        """Generate comprehensive explanation for a report."""
        keyword_result = self._keyword_explainer.explain(text, top_k=top_k)

        shap_result = None
        if self._shap_explainer is not None:
            shap_result = self._shap_explainer.explain(text, top_k=top_k)

        important_features = self._merge_features(
            keyword_result.get("important_features", []),
            shap_result.get("important_features", []) if shap_result else [],
        )

        explanation = self._build_comprehensive_explanation(
            text, risk_level, confidence,
            detected_hazards or keyword_result.get("detected_hazards", []),
            missing_controls or keyword_result.get("missing_controls", []),
            important_features,
        )

        return {
            "explanation": explanation,
            "important_features": important_features[:top_k],
            "methods_used": self._get_methods_used(),
            "keyword_analysis": keyword_result,
            "shap_analysis": shap_result,
        }

    def _merge_features(
        self,
        keyword_features: list[dict],
        shap_features: list[dict],
    ) -> list[dict]:
        seen = set()
        merged = []

        for f in keyword_features:
            key = f["feature"].lower()
            if key not in seen:
                seen.add(key)
                merged.append(f)

        for f in shap_features:
            key = f["feature"].lower()
            if key not in seen:
                seen.add(key)
                f["source"] = "shap"
                merged.append(f)

        merged.sort(key=lambda x: abs(x.get("value", 0)), reverse=True)
        return merged

    def _build_comprehensive_explanation(
        self,
        text: str,
        risk_level: str,
        confidence: float,
        hazards: list[str],
        missing_controls: list[dict],
        important_features: list[dict],
    ) -> str:
        parts = []

        parts.append(f"Risk Assessment: {risk_level} (confidence: {confidence:.0%})")

        if hazards:
            hazard_str = ", ".join(h.replace("_", " ") for h in hazards[:4])
            parts.append(f"Detected hazards: {hazard_str}.")

        if important_features:
            top_factors = important_features[:3]
            factor_strs = []
            for f in top_factors:
                direction = "supports" if "increases" in f.get("direction", "") else "reduces"
                factor_strs.append(f'"{f["feature"]}" {direction} risk')
            parts.append(f"Key evidence: {'; '.join(factor_strs)}.")

        if missing_controls:
            ctrl_names = []
            for c in missing_controls[:3]:
                if isinstance(c, dict):
                    ctrl_names.append(c.get("control", ""))
                else:
                    ctrl_names.append(str(c))
            parts.append(f"Control gaps identified: {', '.join(ctrl_names)}.")

        if risk_level == "HIGH":
            parts.append("RECOMMENDATION: Immediate safety team review required. This report describes conditions with serious SIF potential.")
        elif risk_level == "MEDIUM":
            parts.append("RECOMMENDATION: Schedule review by competent safety personnel within 48 hours.")
        else:
            parts.append("RECOMMENDATION: Log for routine safety review.")

        parts.append("DISCLAIMER: This AI-generated analysis supports but does not replace human safety judgment.")

        return " ".join(parts)

    def _get_methods_used(self) -> list[str]:
        methods = ["keyword"]
        if self._shap_explainer is not None:
            methods.append("shap")
        if self._lime_explainer is not None:
            methods.append("lime")
        return methods


explainability_service = ExplainabilityService()
