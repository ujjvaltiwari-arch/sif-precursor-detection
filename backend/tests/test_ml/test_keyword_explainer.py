"""Tests for KeywordExplainer."""

from app.ml.keyword_explainer import KeywordExplainer


class TestKeywordExplainer:
    def test_init(self):
        explainer = KeywordExplainer()
        assert explainer.keyword_extractor is not None

    def test_explain_high_risk(self):
        explainer = KeywordExplainer()
        result = explainer.explain(
            "Worker was without harness while working at height. "
            "No permit was obtained and gas testing was not done."
        )
        assert result["method"] == "keyword"
        assert len(result["important_features"]) > 0
        assert len(result["detected_hazards"]) > 0
        assert len(result["missing_controls"]) > 0
        assert "high" in result["risk_signals"]

    def test_explain_medium_risk(self):
        explainer = KeywordExplainer()
        result = explainer.explain("Minor slip reported, slight delay in inspection schedule.")
        assert result["method"] == "keyword"
        assert "medium" in result["risk_signals"]

    def test_explain_low_risk(self):
        explainer = KeywordExplainer()
        result = explainer.explain("Reported minor issue, inspected and corrected immediately.")
        assert result["method"] == "keyword"

    def test_explain_empty_text(self):
        explainer = KeywordExplainer()
        result = explainer.explain("")
        assert result["method"] == "keyword"
        assert result["important_features"] == []

    def test_narrative_generation(self):
        explainer = KeywordExplainer()
        result = explainer.explain(
            "Working at height without harness. No gas testing performed."
        )
        narrative = result["explanation"]
        assert isinstance(narrative, str)
        assert len(narrative) > 0
        assert "AI-assisted" in narrative

    def test_top_k_limit(self):
        explainer = KeywordExplainer()
        result = explainer.explain(
            "Confined space entry without gas testing. "
            "Live electrical work without isolation. "
            "Working at height without harness. "
            "No permit to work obtained.",
            top_k=3,
        )
        assert len(result["important_features"]) <= 3
