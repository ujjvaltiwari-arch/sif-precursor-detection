"""Tests for Pydantic schemas validation."""

import pytest
from pydantic import ValidationError

from app.schemas.report import ReportCreate
from app.schemas.prediction import AnalyzeRequest


class TestAnalyzeRequest:
    def test_valid(self):
        req = AnalyzeRequest(report_text="Worker fell from scaffold working", report_type="unsafe_act")
        assert req.report_text == "Worker fell from scaffold working"
        assert req.report_type == "unsafe_act"
        assert req.site is None

    def test_valid_with_optional(self):
        req = AnalyzeRequest(
            report_text="Near miss during drilling",
            report_type="near_miss",
            site="Digboi",
            department="Drilling",
            date="2025-06-15",
        )
        assert req.site == "Digboi"

    def test_missing_text_fails(self):
        with pytest.raises(ValidationError):
            AnalyzeRequest(report_type="unsafe_act")

    def test_missing_type_fails(self):
        with pytest.raises(ValidationError):
            AnalyzeRequest(report_text="Some valid report text here")


class TestReportCreate:
    def test_valid_unsafe_act(self):
        report = ReportCreate(report_text="Valid report text with enough chars", report_type="unsafe_act")
        assert report.report_text == "Valid report text with enough chars"

    def test_valid_near_miss(self):
        report = ReportCreate(report_text="Another valid report text here", report_type="near_miss")
        assert report.report_type == "near_miss"

    def test_valid_unsafe_condition(self):
        report = ReportCreate(report_text="Yet another valid report text", report_type="unsafe_condition")
        assert report.report_type == "unsafe_condition"

    def test_too_short_text_fails(self):
        with pytest.raises(ValidationError):
            ReportCreate(report_text="short", report_type="unsafe_act")

    def test_invalid_type_fails(self):
        with pytest.raises(ValidationError):
            ReportCreate(report_text="Valid report text here with enough", report_type="incident")

    def test_all_fields(self):
        report = ReportCreate(
            report_text="Test report with all fields populated",
            report_type="unsafe_act",
            site="Digboi",
            department="Drilling",
            hazard_type="slip_trip_fall",
            work_type="drilling",
        )
        assert report.site == "Digboi"
        assert report.hazard_type == "slip_trip_fall"
