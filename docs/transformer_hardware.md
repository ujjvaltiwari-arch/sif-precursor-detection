# Transformer Model — Hardware Requirements

## Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **RAM** | 8 GB minimum, 16 GB recommended |
| **GPU** | Optional (CPU training works but is slow) |
| **VRAM** | 4 GB minimum if using GPU |
| **Disk** | 500 MB for model weights + tokenizer |
| **Internet** | Required for initial model download |

## Recommended Setup

| Component | Recommendation |
|-----------|----------------|
| **GPU** | NVIDIA GPU with CUDA support (GTX 1660+ or better) |
| **VRAM** | 6-8 GB for batch_size=16, max_length=512 |
| **RAM** | 16 GB |
| **Python** | 3.10-3.12 |
| **PyTorch** | 2.0+ |

## Model Size Estimates

| Model | Parameters | Disk | VRAM (inference) |
|-------|-----------|------|-----------------|
| bert-base-uncased | 110M | 440 MB | ~1 GB |
| ai4bharat/indic-bert | 110M | 440 MB | ~1 GB |
| google/muril-base-cased | 110M | 440 MB | ~1 GB |

## Training Time Estimates

| Dataset Size | CPU (per epoch) | GPU (per epoch) |
|-------------|-----------------|-----------------|
| 175 samples | ~5 min | ~30 sec |
| 1000 samples | ~20 min | ~2 min |
| 5000 samples | ~60 min | ~8 min |

## External Training Option

If local training is too slow, the architecture supports:

1. **Export data** → CSV/JSON from `data/processed/`
2. **Train externally** → Google Colab, Kaggle, or cloud GPU
3. **Save model** → Upload `models/transformer/` artifacts
4. **Load locally** → The `TransformerClassifier.load_model()` loads saved weights

### Google Colab Setup

```python
# !pip install transformers torch scikit-learn
# Upload data/processed/train.json and val.json
# Run scripts/train_transformer.py
# Download models/transformer/ folder
```

## Configuration

Adjust these parameters in `scripts/train_transformer.py`:

```python
model_name = "bert-base-uncased"  # or indic-bert, muril
max_length = 256                  # reduce for faster training
batch_size = 8                    # increase if GPU memory allows
learning_rate = 2e-5
num_epochs = 5                    # 3-10 typical
dropout = 0.3
```
