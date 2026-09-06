"""Tests for LIMEExplainer."""

import numpy as np

from app.ml.lime_explainer import LIMEExplainer


def mock_predict(text):
    """Mock prediction returning [high_prob, medium_prob, low_prob]."""
    if "without" in text.lower() or "no " in text.lower():
        return np.array([0.8, 0.15, 0.05])
    return np.array([0.1, 0.2, 0.7])


class TestLIMEExplainer:
    def test_init(self):
        explainer = LIMEExplainer(predict_fn=mock_predict, class_labels=["HIGH", "MEDIUM", "LOW"])
        assert explainer.class_labels == ["HIGH", "MEDIUM", "LOW"]
        assert explainer._explainer is None

    def test_explain_success(self):
        explainer = LIMEExplainer(predict_fn=mock_predict, class_labels=["HIGH", "MEDIUM", "LOW"])
        result = explainer.explain(
            "Worker without harness working at height in confined space",
            num_samples=200,
            top_k=5,
        )
        assert result["method"] in ("lime", "keyword_fallback")
        assert "important_features" in result

    def test_fallback_when_lime_fails(self):
        def bad_predict(text):
            raise RuntimeError("Model unavailable")

        explainer = LIMEExplainer(predict_fn=bad_predict, class_labels=["HIGH", "MEDIUM", "LOW"])
        result = explainer.explain("Some incident report with enough text")
        assert result["method"] == "keyword_fallback"

    def test_fallback_explain(self):
        explainer = LIMEExplainer(predict_fn=mock_predict, class_labels=["HIGH", "MEDIUM", "LOW"])
        result = explainer._fallback_explain("Confined space without gas testing entry")
        assert result["method"] == "keyword_fallback"
        assert len(result["important_features"]) > 0

    def test_format_explanation_empty(self):
        explainer = LIMEExplainer(predict_fn=mock_predict, class_labels=["HIGH"])
        result = explainer._format_lime_explanation([])
        assert result == "No significant features detected."

    def test_format_explanation_with_features(self):
        explainer = LIMEExplainer(predict_fn=mock_predict, class_labels=["HIGH"])
        features = [
            {"feature": "harness", "value": 0.5, "direction": "increases risk"},
            {"feature": "safe", "value": -0.3, "direction": "decreases risk"},
        ]
        result = explainer._format_lime_explanation(features)
        assert "harness" in result
        assert "increases" in result
        assert "decreases" in result
