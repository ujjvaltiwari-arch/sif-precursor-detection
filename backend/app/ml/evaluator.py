"""Model evaluation utilities."""

from typing import Any


def format_metrics(metrics: dict[str, Any]) -> str:
    """Format metrics dict as readable string."""
    lines = [
        f"Dataset: {metrics['dataset']}",
        f"Accuracy:  {metrics['accuracy']:.4f}",
        f"Precision: {metrics['precision_macro']:.4f} (macro) / {metrics['precision_weighted']:.4f} (weighted)",
        f"Recall:    {metrics['recall_macro']:.4f} (macro) / {metrics['recall_weighted']:.4f} (weighted)",
        f"F1 Score:  {metrics['f1_macro']:.4f} (macro) / {metrics['f1_weighted']:.4f} (weighted)",
        "",
        "Classification Report:",
        metrics["report"],
    ]
    return "\n".join(lines)


def print_confusion_matrix(metrics: dict[str, Any]) -> str:
    """Format confusion matrix as readable string."""
    cm = metrics["confusion_matrix"]
    labels = metrics["labels"]
    header = "        " + "  ".join(f"{l:>8}" for l in labels)
    lines = [header]
    for i, row in enumerate(cm):
        row_str = "  ".join(f"{v:>8}" for v in row)
        lines.append(f"{labels[i]:>8}  {row_str}")
    return "\n".join(lines)