"""CSV and JSON data loaders for safety reports."""

import csv
import json
from pathlib import Path
from typing import Any

from app.nlp.text_cleaner import TextCleaner


class ReportLoader:
    """Load safety reports from CSV or JSON files."""

    def __init__(self):
        self.cleaner = TextCleaner()

    def load_csv(self, filepath: str | Path) -> list[dict[str, Any]]:
        filepath = Path(filepath)
        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {filepath}")

        reports = []
        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                report = self._process_row(row)
                if report:
                    reports.append(report)
        return reports

    def load_json(self, filepath: str | Path) -> list[dict[str, Any]]:
        filepath = Path(filepath)
        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {filepath}")

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        if isinstance(data, dict):
            data = data.get("reports", [data])

        reports = []
        for item in data:
            report = self._process_row(item)
            if report:
                reports.append(report)
        return reports

    def load(self, filepath: str | Path) -> list[dict[str, Any]]:
        filepath = Path(filepath)
        suffix = filepath.suffix.lower()
        if suffix == ".csv":
            return self.load_csv(filepath)
        elif suffix == ".json":
            return self.load_json(filepath)
        else:
            raise ValueError(f"Unsupported file format: {suffix}")

    def _process_row(self, row: dict[str, Any]) -> dict[str, Any] | None:
        report_text = row.get("report_text", "").strip()
        if not report_text:
            return None

        cleaned_text = self.cleaner.clean(report_text)

        return {
            "report_id": row.get("report_id"),
            "report_text": cleaned_text,
            "original_text": report_text,
            "report_type": row.get("report_type", "unsafe_act"),
            "site": row.get("site", ""),
            "department": row.get("department", ""),
            "date": row.get("date", ""),
            "hazard_type": row.get("hazard_type", ""),
            "work_type": row.get("work_type", ""),
            "language": row.get("language", "en"),
            "is_synthetic": row.get("is_synthetic", "false").lower() == "true",
            "label_source": row.get("label_source", "synthetic"),
            "precursor_categories": row.get("precursor_categories", ""),
            "risk_level": row.get("risk_level", ""),
            "missing_controls": row.get("missing_controls", ""),
        }
