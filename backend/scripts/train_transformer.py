"""Train transformer model on the synthetic dataset."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.ml.transformer_model import check_availability
from app.ml.transformer_trainer import TransformerTrainer


def main():
    avail = check_availability()
    if not all(avail.values()):
        print("Missing dependencies:")
        for k, v in avail.items():
            print(f"  {k}: {'OK' if v else 'MISSING'}")
        print("\nInstall with:")
        print("  pip install torch --index-url https://download.pytorch.org/whl/cpu")
        print("  pip install transformers")
        return

    data_dir = Path("data/processed")
    model_dir = Path("models/transformer")

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

    print("\nTraining transformer model...")
    trainer = TransformerTrainer(
        model_name="bert-base-uncased",
        max_length=256,
        batch_size=8,
        learning_rate=2e-5,
        num_epochs=5,
        dropout=0.3,
    )

    history = trainer.train(train_texts, train_labels, val_texts, val_labels)

    print("\nEvaluating on test set...")
    test_metrics = trainer.evaluate(test_texts, test_labels)
    print(f"Test Accuracy: {test_metrics['accuracy']:.4f}")

    print("\nSaving model...")
    trainer.save(str(model_dir))
    print(f"Model saved to {model_dir}")

    results = {
        "history": history,
        "test_accuracy": test_metrics["accuracy"],
        "test_loss": test_metrics["loss"],
    }
    with open(model_dir / "evaluation_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print("Done.")


if __name__ == "__main__":
    main()
