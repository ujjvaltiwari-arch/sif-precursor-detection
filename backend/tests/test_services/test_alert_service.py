"""Tests for AlertService."""

import pytest
from datetime import date

from app.models.alert import Alert
from app.models.report import Report
from app.services.alert_service import AlertService


@pytest.fixture
def svc():
    return AlertService()


@pytest.fixture(autouse=True)
def clean_db(test_db_session):
    test_db_session.rollback()
    test_db_session.query(Alert).delete(synchronize_session=False)
    test_db_session.query(Report).delete(synchronize_session=False)
    test_db_session.commit()
    yield
    test_db_session.rollback()
    test_db_session.query(Alert).delete(synchronize_session=False)
    test_db_session.query(Report).delete(synchronize_session=False)
    test_db_session.commit()


@pytest.fixture
def sample_report(test_db_session):
    report = Report(
        report_text="Test alert report text for service testing",
        report_type="unsafe_act",
        date=date.today(),
    )
    test_db_session.add(report)
    test_db_session.commit()
    test_db_session.refresh(report)
    return report


@pytest.fixture
def sample_alert(test_db_session, sample_report):
    alert = Alert(
        report_id=sample_report.id,
        risk_level="HIGH",
        alert_type="sif_precursor_detected",
        status="open",
    )
    test_db_session.add(alert)
    test_db_session.commit()
    test_db_session.refresh(alert)
    return alert


class TestListAlerts:
    def test_list_empty(self, test_db_session, svc):
        result = svc.list_alerts(test_db_session)
        assert result == []

    def test_list_with_data(self, test_db_session, svc, sample_alert):
        result = svc.list_alerts(test_db_session)
        assert len(result) == 1
        assert result[0]["risk_level"] == "HIGH"
        assert result[0]["status"] == "open"

    def test_filter_by_status(self, test_db_session, svc, sample_alert):
        result = svc.list_alerts(test_db_session, status="open")
        assert len(result) == 1
        result = svc.list_alerts(test_db_session, status="resolved")
        assert len(result) == 0

    def test_filter_by_risk_level(self, test_db_session, svc, sample_alert):
        result = svc.list_alerts(test_db_session, risk_level="HIGH")
        assert len(result) == 1
        result = svc.list_alerts(test_db_session, risk_level="LOW")
        assert len(result) == 0

    def test_report_text_truncation(self, test_db_session, svc):
        long_text = "A" * 150
        report = Report(report_text=long_text, report_type="unsafe_act", date=date.today())
        test_db_session.add(report)
        test_db_session.commit()
        test_db_session.refresh(report)
        alert = Alert(report_id=report.id, risk_level="LOW", alert_type="test", status="open")
        test_db_session.add(alert)
        test_db_session.commit()
        result = svc.list_alerts(test_db_session)
        assert result[0]["report_text"].endswith("...")
        assert len(result[0]["report_text"]) <= 104


class TestAcknowledge:
    def test_acknowledge_existing(self, test_db_session, svc, sample_alert):
        result = svc.acknowledge(test_db_session, sample_alert.id)
        assert result is not None
        assert result.status == "acknowledged"

    def test_acknowledge_nonexistent(self, test_db_session, svc):
        result = svc.acknowledge(test_db_session, 99999)
        assert result is None


class TestResolve:
    def test_resolve_existing(self, test_db_session, svc, sample_alert):
        result = svc.resolve(test_db_session, sample_alert.id, notes="Fixed by team")
        assert result is not None
        assert result.status == "resolved"
        assert result.resolved_at is not None
        assert result.notes == "Fixed by team"

    def test_resolve_without_notes(self, test_db_session, svc, sample_alert):
        result = svc.resolve(test_db_session, sample_alert.id)
        assert result.status == "resolved"
        assert result.resolved_at is not None

    def test_resolve_nonexistent(self, test_db_session, svc):
        result = svc.resolve(test_db_session, 99999)
        assert result is None


class TestDismiss:
    def test_dismiss_existing(self, test_db_session, svc, sample_alert):
        result = svc.dismiss(test_db_session, sample_alert.id)
        assert result is not None
        assert result.status == "dismissed"

    def test_dismiss_nonexistent(self, test_db_session, svc):
        result = svc.dismiss(test_db_session, 99999)
        assert result is None
