"""Transformer trainer for SIF precursor detection."""

import json
import logging
from pathlib import Path
from typing import Any

try:
    import torch
    import torch.nn as nn
    from torch.optim import AdamW
    from torch.utils.data import DataLoader
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

try:
    from transformers import AutoTokenizer, get_linear_schedule_with_warmup
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

from app.ml.transformer_model import TransformerModel

logger = logging.getLogger(__name__)


class TransformerTrainer:
    """Train transformer model for risk classification."""

    def __init__(
        self,
        model_name: str = "bert-base-uncased",
        num_labels: int = 3,
        max_length: int = 256,
        batch_size: int = 16,
        learning_rate: float = 2e-5,
        num_epochs: int = 10,
        warmup_ratio: float = 0.1,
        weight_decay: float = 0.01,
        dropout: float = 0.3,
        device: str | None = None,
    ):
        self.model_name = model_name
        self.num_labels = num_labels
        self.max_length = max_length
        self.batch_size = batch_size
        self.learning_rate = learning_rate
        self.num_epochs = num_epochs
        self.warmup_ratio = warmup_ratio
        self.weight_decay = weight_decay
        self.dropout = dropout
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        self.tokenizer = None
        self.model = None
        self.label_map: dict[str, int] = {}
        self.id_to_label: dict[int, str] = {}

    def prepare(
        self,
        train_texts: list[str],
        train_labels: list[str],
    ) -> None:
        """Prepare tokenizer and label mapping."""
        if not TORCH_AVAILABLE or not TRANSFORMERS_AVAILABLE:
            raise RuntimeError("torch and transformers are required")

        unique_labels = sorted(set(train_labels))
        self.label_map = {l: i for i, l in enumerate(unique_labels)}
        self.id_to_label = {i: l for l, i in self.label_map.items()}
        self.num_labels = len(unique_labels)

        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = TransformerModel(
            self.model_name, self.num_labels, self.dropout
        ).to(self.device)

        logger.info(
            "Prepared model: %s, labels: %s, device: %s",
            self.model_name, list(self.label_map.keys()), self.device,
        )

    def train(
        self,
        train_texts: list[str],
        train_labels: list[str],
        val_texts: list[str] | None = None,
        val_labels: list[str] | None = None,
    ) -> dict[str, Any]:
        """Train the model and return training history."""
        if self.model is None:
            self.prepare(train_texts, train_labels)

        train_dataset = self._create_dataset(train_texts, train_labels)
        train_loader = DataLoader(
            train_dataset, batch_size=self.batch_size, shuffle=True
        )

        optimizer = AdamW(
            self.model.parameters(),
            lr=self.learning_rate,
            weight_decay=self.weight_decay,
        )
        total_steps = len(train_loader) * self.num_epochs
        warmup_steps = int(total_steps * self.warmup_ratio)
        scheduler = get_linear_schedule_with_warmup(
            optimizer, warmup_steps, total_steps
        )

        history = {"train_loss": [], "val_loss": [], "val_accuracy": []}

        for epoch in range(self.num_epochs):
            self.model.train()
            total_loss = 0.0
            for batch in train_loader:
                texts, labels = batch
                encoding = self.tokenizer(
                    list(texts),
                    max_length=self.max_length,
                    padding=True,
                    truncation=True,
                    return_tensors="pt",
                ).to(self.device)
                labels = torch.tensor(list(labels), dtype=torch.long).to(self.device)

                optimizer.zero_grad()
                outputs = self.model(
                    input_ids=encoding["input_ids"],
                    attention_mask=encoding["attention_mask"],
                )
                loss = nn.CrossEntropyLoss()(outputs, labels)
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
                optimizer.step()
                scheduler.step()
                total_loss += loss.item()

            avg_loss = total_loss / len(train_loader)
            history["train_loss"].append(avg_loss)

            if val_texts and val_labels:
                val_metrics = self.evaluate(val_texts, val_labels)
                history["val_loss"].append(val_metrics.get("loss", 0))
                history["val_accuracy"].append(val_metrics["accuracy"])
                logger.info(
                    "Epoch %d/%d - loss: %.4f - val_acc: %.4f",
                    epoch + 1, self.num_epochs, avg_loss, val_metrics["accuracy"],
                )
            else:
                logger.info("Epoch %d/%d - loss: %.4f", epoch + 1, self.num_epochs, avg_loss)

        return history

    def evaluate(
        self,
        texts: list[str],
        labels: list[str],
    ) -> dict[str, Any]:
        """Evaluate model on a dataset."""
        if self.model is None:
            raise RuntimeError("Model not initialized")

        dataset = self._create_dataset(texts, labels)
        loader = DataLoader(dataset, batch_size=self.batch_size)

        self.model.eval()
        total_loss = 0.0
        correct = 0
        total = 0
        all_preds = []
        all_labels = []

        with torch.no_grad():
            for batch in loader:
                texts_batch, labels_batch = batch
                encoding = self.tokenizer(
                    list(texts_batch),
                    max_length=self.max_length,
                    padding=True,
                    truncation=True,
                    return_tensors="pt",
                ).to(self.device)
                labels_tensor = torch.tensor(
                    list(labels_batch), dtype=torch.long
                ).to(self.device)

                outputs = self.model(
                    input_ids=encoding["input_ids"],
                    attention_mask=encoding["attention_mask"],
                )
                loss = nn.CrossEntropyLoss()(outputs, labels_tensor)
                total_loss += loss.item()

                preds = outputs.argmax(dim=-1)
                correct += (preds == labels_tensor).sum().item()
                total += len(labels_tensor)
                all_preds.extend(preds.cpu().tolist())
                all_labels.extend(labels_batch)

        accuracy = correct / total if total > 0 else 0
        avg_loss = total_loss / len(loader) if len(loader) > 0 else 0

        return {
            "accuracy": accuracy,
            "loss": avg_loss,
            "total": total,
            "correct": correct,
            "predictions": all_preds,
            "true_labels": all_labels,
        }

    def save(self, output_dir: str) -> None:
        """Save model, tokenizer, and config."""
        path = Path(output_dir)
        path.mkdir(parents=True, exist_ok=True)

        self.model.cpu().save(output_dir)

        config = {
            "model_name": self.model_name,
            "num_labels": self.num_labels,
            "max_length": self.max_length,
            "batch_size": self.batch_size,
            "learning_rate": self.learning_rate,
            "num_epochs": self.num_epochs,
            "label_map": self.label_map,
        }
        with open(path / "training_config.json", "w") as f:
            json.dump(config, f, indent=2)

        self.model.to(self.device)
        logger.info("Model saved to %s", output_dir)

    def _create_dataset(self, texts: list[str], labels: list[str]):
        encoded_labels = [self.label_map[l] for l in labels]
        return list(zip(texts, encoded_labels))
