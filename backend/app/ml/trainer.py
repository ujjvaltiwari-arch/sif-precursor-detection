"""Baseline model trainer: TF-IDF + Logistic Regression."""

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)

from app.ml.feature_extractor import FeatureExtractor


class BaselineTrainer:
    """Train TF-IDF + Logistic Regression baseline."""

    def __init__(
        self,
        max_features: int = 50000,
        ngram_range: tuple[int, int] = (1, 3),
        C: float = 1.0,
        max_iter: int = 1000,
        class_weight: str = "balanced",
    ):
        self.feature_extractor = FeatureExtractor(
            max_features=max_features,
            ngram_range=ngram_range,
        )
        self.classifier = LogisticRegression(
            C=C,
            max_iter=max_iter,
            class_weight=class_weight,
            solver="lbfgs",
            random_state=42,
        )
        self._trained = False

    def train(
        self,
        train_texts: list[str],
        train_labels: list[str],
    ) -> dict[str, Any]:
        """Train the model and return metrics."""
        X_train = self.feature_extractor.fit_transform(train_texts)
        self.classifier.fit(X_train, train_labels)
        self._trained = True

        y_pred = self.classifier.predict(X_train)
        return self._compute_metrics(train_labels, y_pred, "train")

    def evaluate(
        self,
        texts: list[str],
        true_labels: list[str],
        dataset_name: str = "test",
    ) -> dict[str, Any]:
        """Evaluate on a dataset."""
        if not self._trained:
            raise RuntimeError("Model must be trained before evaluation")

        X = self.feature_extractor.transform(texts)
        y_pred = self.classifier.predict(X)
        return self._compute_metrics(true_labels, y_pred, dataset_name)

    def predict(self, texts: list[str]) -> list[str]:
        if not self._trained:
            raise RuntimeError("Model must be trained before prediction")
        X = self.feature_extractor.transform(texts)
        return self.classifier.predict(X).tolist()

    def predict_proba(self, texts: list[str]) -> np.ndarray:
        if not self._trained:
            raise RuntimeError("Model must be trained before prediction")
        X = self.feature_extractor.transform(texts)
        return self.classifier.predict_proba(X)

    def get_class_labels(self) -> list[str]:
        return list(self.classifier.classes_)

    def _compute_metrics(
        self, y_true: list[str], y_pred: list[str], dataset_name: str
    ) -> dict[str, Any]:
        labels = sorted(set(y_true) | set(y_pred))

        metrics = {
            "dataset": dataset_name,
            "accuracy": float(accuracy_score(y_true, y_pred)),
            "precision_macro": float(precision_score(y_true, y_pred, average="macro", zero_division=0)),
            "recall_macro": float(recall_score(y_true, y_pred, average="macro", zero_division=0)),
            "f1_macro": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
            "precision_weighted": float(precision_score(y_true, y_pred, average="weighted", zero_division=0)),
            "recall_weighted": float(recall_score(y_true, y_pred, average="weighted", zero_division=0)),
            "f1_weighted": float(f1_score(y_true, y_pred, average="weighted", zero_division=0)),
            "confusion_matrix": confusion_matrix(y_true, y_pred, labels=labels).tolist(),
            "labels": labels,
            "report": classification_report(y_true, y_pred, labels=labels, zero_division=0),
            "support": {label: int(np.sum(np.array(y_true) == label)) for label in labels},
        }
        return metrics

    def save(self, directory: str) -> None:
        path = Path(directory)
        path.mkdir(parents=True, exist_ok=True)
        self.feature_extractor.save(str(path))
        joblib.dump(self.classifier, path / "logistic_regression.joblib")
        meta = {
            "model_type": "logistic_regression",
            "classes": self.get_class_labels(),
            "n_features": self.classifier.coef_.shape[1] if hasattr(self.classifier, "coef_") else 0,
            "trained": self._trained,
        }
        with open(path / "model_config.json", "w") as f:
            json.dump(meta, f, indent=2)

    @classmethod
    def load(cls, directory: str) -> "BaselineTrainer":
        path = Path(directory)
        instance = cls()
        instance.feature_extractor = FeatureExtractor.load(str(path))
        instance.classifier = joblib.load(path / "logistic_regression.joblib")
        instance._trained = True
        return instance
