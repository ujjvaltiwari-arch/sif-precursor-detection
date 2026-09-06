"""Tests for ML training and prediction components."""

import json
import tempfile
from pathlib import Path

import pytest

from app.ml.feature_extractor import FeatureExtractor
from app.ml.trainer import BaselineTrainer
from app.ml.pipeline import PredictionService


SAMPLE_TEXTS = [
    "Worker entered confined space without gas testing and no permit",
    "Electrician performed live work without LOTO isolation",
    "Worker climbed scaffold without fall protection harness",
    "Minor cut while opening package first aid applied",
    "Safety sign was found faded at entrance to hazardous area",
    "Driller climbed derrick without harness in strong wind",
    "Worker forgot to wear safety glasses near rotating equipment",
    "Fire extinguisher pressure in yellow zone during inspection",
    "Crane operated over personnel without designated signalman",
    "Vehicle horn not working during pre-use inspection",
]

SAMPLE_LABELS = [
    "HIGH", "HIGH", "HIGH",
    "LOW", "LOW",
    "HIGH", "MEDIUM", "LOW",
    "HIGH", "LOW",
]


def test_feature_extractor_fit_transform():
    fe = FeatureExtractor(max_features=100, ngram_range=(1, 2))
    X = fe.fit_transform(SAMPLE_TEXTS)
    assert X.shape[0] == len(SAMPLE_TEXTS)
    assert X.shape[1] > 0


def test_feature_extractor_save_load():
    with tempfile.TemporaryDirectory() as tmpdir:
        fe = FeatureExtractor(max_features=100)
        fe.fit_transform(SAMPLE_TEXTS)
        fe.save(tmpdir)

        loaded = FeatureExtractor.load(tmpdir)
        X_orig = fe.transform(SAMPLE_TEXTS)
        X_loaded = loaded.transform(SAMPLE_TEXTS)
        assert X_orig.shape == X_loaded.shape


def test_baseline_trainer_train():
    trainer = BaselineTrainer(max_features=100, ngram_range=(1, 2))
    metrics = trainer.train(SAMPLE_TEXTS, SAMPLE_LABELS)
    assert "accuracy" in metrics
    assert 0.0 <= metrics["accuracy"] <= 1.0
    assert "labels" in metrics


def test_baseline_trainer_predict():
    trainer = BaselineTrainer(max_features=100, ngram_range=(1, 2))
    trainer.train(SAMPLE_TEXTS, SAMPLE_LABELS)
    preds = trainer.predict(["Worker fell from height without harness"])
    assert len(preds) == 1
    assert preds[0] in ["HIGH", "MEDIUM", "LOW"]


def test_baseline_trainer_predict_proba():
    trainer = BaselineTrainer(max_features=100, ngram_range=(1, 2))
    trainer.train(SAMPLE_TEXTS, SAMPLE_LABELS)
    proba = trainer.predict_proba(["Worker fell from height"])
    assert proba.shape[0] == 1
    assert proba.shape[1] == 3
    assert abs(sum(proba[0]) - 1.0) < 0.01


def test_baseline_trainer_save_load():
    with tempfile.TemporaryDirectory() as tmpdir:
        trainer = BaselineTrainer(max_features=100, ngram_range=(1, 2))
        trainer.train(SAMPLE_TEXTS, SAMPLE_LABELS)
        trainer.save(tmpdir)

        loaded = BaselineTrainer.load(tmpdir)
        preds_orig = trainer.predict(["confined space entry without testing"])
        preds_loaded = loaded.predict(["confined space entry without testing"])
        assert preds_orig == preds_loaded


def test_prediction_service_rule_based():
    service = PredictionService()
    result = service.analyze(
        "Worker entered confined space without proper gas testing and without isolation"
    )
    assert "risk_level" in result
    assert result["risk_level"] in ["HIGH", "MEDIUM", "LOW"]
    assert "confidence_score" in result
    assert "explanation" in result
    assert "detected_hazards" in result
    assert "missing_controls" in result
    assert "important_phrases" in result


def test_prediction_service_generates_explanation():
    service = PredictionService()
    result = service.analyze("Electrician bypassed safety interlock on motor control center")
    assert len(result["explanation"]) > 20
    assert "risk" in result["explanation"].lower()
