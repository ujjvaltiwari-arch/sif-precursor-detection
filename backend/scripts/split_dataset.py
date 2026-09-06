"""Split dataset into train/validation/test sets."""

import json
import random
from pathlib import Path


def split_dataset(
    data_path: str,
    output_dir: str = "data/processed",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42,
) -> dict[str, any]:
    """Split loaded data into train/val/test and save."""
    random.seed(seed)

    path = Path(data_path)
    if path.suffix == ".json":
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        reports = data.get("reports", data) if isinstance(data, dict) else data
    else:
        raise ValueError(f"Unsupported format: {path.suffix}")

    random.shuffle(reports)

    total = len(reports)
    train_end = int(total * train_ratio)
    val_end = train_end + int(total * val_ratio)

    splits = {
        "train": reports[:train_end],
        "val": reports[train_end:val_end],
        "test": reports[val_end:],
    }

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    stats = {}
    for split_name, split_data in splits.items():
        out_file = output_path / f"{split_name}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump({"reports": split_data, "count": len(split_data)}, f, indent=2)
        stats[split_name] = len(split_data)

    stats["total"] = total
    stats["output_dir"] = str(output_path)
    return stats


if __name__ == "__main__":
    import sys

    data_file = sys.argv[1] if len(sys.argv) > 1 else "data/synthetic/synthetic_reports.json"
    result = split_dataset(data_file)
    print(f"Split complete: {result}")
