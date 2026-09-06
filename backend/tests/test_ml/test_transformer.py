"""Tests for transformer model components."""

import pytest

from app.ml.transformer_model import check_availability


def test_check_availability():
    avail = check_availability()
    assert isinstance(avail, dict)
    assert "torch" in avail
    assert "transformers" in avail
    assert isinstance(avail["torch"], bool)
    assert isinstance(avail["transformers"], bool)


@pytest.mark.skipif(
    not check_availability()["torch"],
    reason="torch not installed"
)
def test_transformer_model_import():
    from app.ml.transformer_model import TransformerModel, TransformerClassifier
    assert TransformerModel is not None
    assert TransformerClassifier is not None


@pytest.mark.skipif(
    not check_availability()["torch"],
    reason="torch not installed"
)
def test_transformer_classifier_init():
    from app.ml.transformer_model import TransformerClassifier
    clf = TransformerClassifier(model_name="bert-base-uncased", num_labels=3)
    assert clf.model_name == "bert-base-uncased"
    assert clf.num_labels == 3
    assert clf.is_loaded is False


@pytest.mark.skipif(
    not check_availability()["torch"],
    reason="torch not installed"
)
def test_transformer_model_forward():
    import torch
    from app.ml.transformer_model import TransformerModel
    model = TransformerModel("bert-base-uncased", num_labels=3)
    input_ids = torch.randint(0, 1000, (1, 32))
    attention_mask = torch.ones(1, 32, dtype=torch.long)
    output = model(input_ids=input_ids, attention_mask=attention_mask)
    assert output.shape == (1, 3)


@pytest.mark.skipif(
    not check_availability()["torch"],
    reason="torch not installed"
)
def test_transformer_trainer_init():
    from app.ml.transformer_trainer import TransformerTrainer
    trainer = TransformerTrainer(model_name="bert-base-uncased", num_labels=3)
    assert trainer.model_name == "bert-base-uncased"
    assert trainer.num_labels == 3
