"""Train the baseline model on the synthetic dataset."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.ml.trainer import BaselineTrainer
from app.ml.evaluator import format_metrics, print_confusion_matrix


def main():
    data_dir = Path("data/processed")
    model_dir = Path("models/baseline")

    print("Loading datasets...")
    with open(data_dir / "train.json") as f:
        train_data = json.load(f)["reports"]
    with open(data_dir / "val.json") as f:
        val_data = json.load(f)["reports"]
    with open(data_dir / "test.json") as f:
        test_data = json.load(f)["reports"]

    train_texts = [r["report_text"] for r in train_data]
    train_labels = [r["risk_level"] for r in train_data]
    val_texts = [r["report_text"] for r in val_data]
    val_labels = [r["risk_level"] for r in val_data]
    test_texts = [r["report_text"] for r in test_data]
    test_labels = [r["risk_level"] for r in test_data]

    print(f"Train: {len(train_texts)} | Val: {len(val_texts)} | Test: {len(test_texts)}")

    print("\nTraining baseline model (TF-IDF + Logistic Regression)...")
    trainer = BaselineTrainer(max_features=30000, ngram_range=(1, 2), C=1.0)
    train_metrics = trainer.train(train_texts, train_labels)
    print("\n=== Train Metrics ===")
    print(format_metrics(train_metrics))

    print("\n=== Validation Metrics ===")
    val_metrics = trainer.evaluate(val_texts, val_labels, "validation")
    print(format_metrics(val_metrics))
    print("\nConfusion Matrix:")
    print(print_confusion_matrix(val_metrics))

    print("\n=== Test Metrics ===")
    test_metrics = trainer.evaluate(test_texts, test_labels, "test")
    print(format_metrics(test_metrics))
    print("\nConfusion Matrix:")
    print(print_confusion_matrix(test_metrics))

    print("\nSaving model...")
    trainer.save(str(model_dir))
    print(f"Model saved to {model_dir}")

    results = {
        "train": {k: v for k, v in train_metrics.items() if k != "report"},
        "val": {k: v for k, v in val_metrics.items() if k != "report"},
        "test": {k: v for k, v in test_metrics.items() if k != "report"},
    }
    with open(model_dir / "evaluation_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print("Evaluation results saved.")


if __name__ == "__main__":
    main()
