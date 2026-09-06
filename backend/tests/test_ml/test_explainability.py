"""Tests for explainability components."""

import pytest

from app.ml.keyword_explainer import KeywordExplainer
from app.ml.explainability import ExplainabilityService


SAMPLE_HIGH_RISK = (
    "Worker entered confined space without proper gas testing and without isolation. "
    "No permit to work was obtained. The space had not been ventilated."
)

SAMPLE_MEDIUM_RISK = (
    "Worker forgot to wear safety glasses while performing grinding near rotating equipment. "
    "Chip guard was not in place and sparks were directed toward flammable material."
)

SAMPLE_LOW_RISK = (
    "Worker noticed and reported a small oil spill near storage tank. "
    "Containment berms were in place. Area was cleaned within 15 minutes."
)


def test_keyword_explainer_high_risk():
    explainer = KeywordExplainer()
    result = explainer.explain(SAMPLE_HIGH_RISK)
    assert result["method"] == "keyword"
    assert len(result["important_features"]) > 0
    assert "confined" in result["explanation"].lower() or "hazard" in result["explanation"].lower()
    assert len(result["explanation"]) > 20


def test_keyword_explainer_detects_hazards():
    explainer = KeywordExplainer()
    result = explainer.explain(SAMPLE_HIGH_RISK)
    hazards = result.get("detected_hazards", [])
    assert "confined_space" in hazards


def test_keyword_explainer_medium_risk():
    explainer = KeywordExplainer()
    result = explainer.explain(SAMPLE_MEDIUM_RISK)
    assert result["method"] == "keyword"
    assert len(result["important_features"]) > 0


def test_keyword_explainer_low_risk():
    explainer = KeywordExplainer()
    result = explainer.explain(SAMPLE_LOW_RISK)
    assert result["method"] == "keyword"
    assert len(result["explanation"]) > 20


def test_keyword_explainer_missing_controls():
    explainer = KeywordExplainer()
    result = explainer.explain(SAMPLE_HIGH_RISK)
    controls = result.get("missing_controls", [])
    assert len(controls) > 0


def test_explainability_service_init():
    service = ExplainabilityService()
    service.initialize()
    assert service._keyword_explainer is not None


def test_explainability_service_explain():
    service = ExplainabilityService()
    service.initialize()
    result = service.explain(
        SAMPLE_HIGH_RISK,
        risk_level="HIGH",
        confidence=0.92,
    )
    assert "explanation" in result
    assert "important_features" in result
    assert "methods_used" in result
    assert len(result["explanation"]) > 30
    assert "keyword" in result["methods_used"]


def test_explainability_comprehensive_output():
    service = ExplainabilityService()
    service.initialize()
    result = service.explain(
        SAMPLE_HIGH_RISK,
        risk_level="HIGH",
        confidence=0.92,
        detected_hazards=["confined_space"],
        missing_controls=[
            {"control": "Gas Testing", "category": "atmospheric_monitoring"},
            {"control": "Permit to Work", "category": "permit_system"},
        ],
    )
    explanation = result["explanation"]
    assert "HIGH" in explanation
    assert "confined" in explanation.lower() or "hazard" in explanation.lower()
    assert "Gas Testing" in explanation or "gas testing" in explanation.lower()
    assert "DISCLAIMER" in explanation
