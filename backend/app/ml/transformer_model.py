"""Transformer-based model for SIF precursor detection."""

import json
from pathlib import Path
from typing import Any, Optional

try:
    import torch
    import torch.nn as nn
    from torch.utils.data import Dataset, DataLoader
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

try:
    from transformers import AutoTokenizer, AutoModel
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False


class SafetyReportDataset:
    """Dataset for safety reports."""

    def __init__(self, texts: list[str], labels: list[str], label_map: dict[str, int]):
        self.texts = texts
        self.labels = [label_map[l] for l in labels]
        self.label_map = label_map

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        return self.texts[idx], self.labels[idx]


class TransformerClassifier:
    """Wrapper for transformer-based classification."""

    DEFAULT_MODEL = "bert-base-uncased"

    def __init__(
        self,
        model_name: str | None = None,
        num_labels: int = 3,
        max_length: int = 256,
        dropout: float = 0.3,
    ):
        self.model_name = model_name or self.DEFAULT_MODEL
        self.num_labels = num_labels
        self.max_length = max_length
        self.dropout_rate = dropout
        self.tokenizer = None
        self.model = None
        self.label_map: dict[str, int] = {}
        self.id_to_label: dict[int, str] = {}
        self._loaded = False

    def load_model(self, model_dir: str) -> bool:
        """Load a saved model from directory."""
        if not TORCH_AVAILABLE or not TRANSFORMERS_AVAILABLE:
            return False

        path = Path(model_dir)
        config_file = path / "transformer_config.json"
        if not config_file.exists():
            return False

        try:
            with open(config_file) as f:
                config = json.load(f)

            self.model_name = config.get("model_name", self.DEFAULT_MODEL)
            self.label_map = config.get("label_map", {})
            self.id_to_label = {v: k for k, v in self.label_map.items()}
            self.num_labels = len(self.label_map)

            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = TransformerModel(
                self.model_name, self.num_labels, self.dropout_rate
            )

            weights_file = path / "model_weights.pt"
            if weights_file.exists():
                state_dict = torch.load(weights_file, map_location="cpu", weights_only=True)
                self.model.load_state_dict(state_dict)

            self.model.eval()
            self._loaded = True
            return True
        except Exception:
            return False

    def save(self, output_dir: str) -> None:
        if not TORCH_AVAILABLE:
            return
        path = Path(output_dir)
        path.mkdir(parents=True, exist_ok=True)

        config = {
            "model_name": self.model_name,
            "num_labels": self.num_labels,
            "max_length": self.max_length,
            "dropout": self.dropout_rate,
            "label_map": self.label_map,
        }
        with open(path / "transformer_config.json", "w") as f:
            json.dump(config, f, indent=2)

        if self.model is not None:
            torch.save(self.model.state_dict(), path / "model_weights.pt")

        if self.tokenizer is not None:
            self.tokenizer.save_pretrained(str(path / "tokenizer"))

    def predict(self, texts: list[str]) -> list[dict[str, Any]]:
        """Predict risk level for a list of texts."""
        if not self._loaded:
            raise RuntimeError("Model not loaded")

        results = []
        self.model.eval()
        with torch.no_grad():
            for text in texts:
                encoding = self.tokenizer(
                    text,
                    max_length=self.max_length,
                    padding="max_length",
                    truncation=True,
                    return_tensors="pt",
                )
                outputs = self.model(
                    input_ids=encoding["input_ids"],
                    attention_mask=encoding["attention_mask"],
                )
                probs = torch.softmax(outputs, dim=-1)
                pred_idx = probs.argmax(dim=-1).item()
                confidence = probs[0][pred_idx].item()
                risk_level = self.id_to_label.get(pred_idx, "MEDIUM")
                results.append({
                    "risk_level": risk_level,
                    "confidence": round(confidence, 4),
                    "probabilities": {
                        self.id_to_label[i]: round(p, 4)
                        for i, p in enumerate(probs[0].tolist())
                    },
                })
        return results

    @property
    def is_loaded(self) -> bool:
        return self._loaded


class TransformerModel(nn.Module):
    """Transformer model with classification head."""

    def __init__(
        self,
        model_name: str,
        num_labels: int,
        dropout: float = 0.3,
    ):
        super().__init__()
        self.encoder = AutoModel.from_pretrained(model_name)
        hidden_size = self.encoder.config.hidden_size
        self.classifier = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(hidden_size, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, num_labels),
        )

    def forward(
        self,
        input_ids: Any,
        attention_mask: Any,
    ) -> Any:
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        pooled = outputs.last_hidden_state[:, 0, :]
        return self.classifier(pooled)


def check_availability() -> dict[str, bool]:
    return {
        "torch": TORCH_AVAILABLE,
        "transformers": TRANSFORMERS_AVAILABLE,
    }
