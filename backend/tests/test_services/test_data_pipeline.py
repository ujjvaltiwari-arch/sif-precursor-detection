"""Tests for data loaders and synthetic data generator."""

import json
import tempfile
from pathlib import Path

import pytest

from app.ml.data_loader import ReportLoader
from scripts.generate_synthetic import generate_synthetic_dataset
from scripts.split_dataset import split_dataset


@pytest.fixture
def sample_csv(tmp_path):
    csv_content = """report_id,report_text,report_type,site,department,date,hazard_type,work_type,precursor_categories,risk_level,missing_controls,language,is_synthetic,label_source
SYN-0001,Worker entered confined space without gas testing,unsafe_act,Dibrugarh Terminal,Drilling,2025-01-15,confined_space,confined space entry,confined_space,HIGH,gas testing; confined space permit,en,true,synthetic
SYN-0002,Minor cut while opening package,near_miss,Jorhat Pump Station,Maintenance,2025-02-10,mechanical,maintenance,mechanical,LOW,first aid kit,en,true,synthetic
SYN-0003,Worker climbed scaffold without harness,unsafe_act,Nazira Oil Field,Production,2025-03-05,gravity,working at height,gravity,HIGH,fall protection harness; guard rails,en,true,synthetic"""
    filepath = tmp_path / "test_reports.csv"
    filepath.write_text(csv_content, encoding="utf-8")
    return filepath


@pytest.fixture
def sample_json(tmp_path):
    data = {
        "reports": [
            {
                "report_id": "TEST-001",
                "report_text": "Worker fell from scaffold without harness",
                "report_type": "unsafe_act",
                "site": "Test Site",
                "department": "Drilling",
                "date": "2025-01-15",
                "hazard_type": "gravity",
                "work_type": "working at height",
                "precursor_categories": "gravity",
                "risk_level": "HIGH",
                "missing_controls": "fall protection harness",
                "language": "en",
                "is_synthetic": "true",
                "label_source": "synthetic",
            }
        ]
    }
    filepath = tmp_path / "test_reports.json"
    filepath.write_text(json.dumps(data), encoding="utf-8")
    return filepath


def test_csv_loader(sample_csv):
    loader = ReportLoader()
    reports = loader.load_csv(sample_csv)
    assert len(reports) == 3
    assert reports[0]["report_type"] == "unsafe_act"
    assert reports[0]["is_synthetic"] is True


def test_json_loader(sample_json):
    loader = ReportLoader()
    reports = loader.load_json(sample_json)
    assert len(reports) == 1
    assert "fell" in reports[0]["report_text"].lower()


def test_loader_auto_detect(sample_csv):
    loader = ReportLoader()
    reports = loader.load(sample_csv)
    assert len(reports) == 3


def test_loader_missing_file():
    loader = ReportLoader()
    with pytest.raises(FileNotFoundError):
        loader.load("nonexistent.csv")


def test_generate_synthetic(tmp_path):
    result = generate_synthetic_dataset(num_reports=20, output_dir=str(tmp_path))
    assert result["count"] == 20
    assert Path(result["csv"]).exists()
    assert Path(result["json"]).exists()

    with open(result["json"], "r") as f:
        data = json.load(f)
    assert data["count"] == 20
    assert data["synthetic"] is True


def test_split_dataset(tmp_path):
    result = generate_synthetic_dataset(num_reports=100, output_dir=str(tmp_path))
    stats = split_dataset(result["json"], output_dir=str(tmp_path / "splits"))
    assert stats["total"] == 100
    assert stats["train"] + stats["val"] + stats["test"] == 100
    assert stats["train"] > stats["val"]
    assert stats["val"] >= stats["test"]
