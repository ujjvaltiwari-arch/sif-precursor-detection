"""Tests for ReportService."""

from datetime import date

import pytest
import uuid

from app.models.alert import Alert
from app.models.department import Department
from app.models.prediction import Prediction
from app.models.report import Report
from app.models.site import Site
from app.services.report_service import ReportService


@pytest.fixture
def svc():
    return ReportService()


@pytest.fixture(autouse=True)
def clean_db(test_db_session):
    test_db_session.rollback()
    test_db_session.query(Alert).delete(synchronize_session=False)
    test_db_session.query(Prediction).delete(synchronize_session=False)
    test_db_session.query(Report).delete(synchronize_session=False)
    test_db_session.query(Department).delete(synchronize_session=False)
    test_db_session.query(Site).delete(synchronize_session=False)
    test_db_session.commit()
    yield
    test_db_session.rollback()
    test_db_session.query(Alert).delete(synchronize_session=False)
    test_db_session.query(Prediction).delete(synchronize_session=False)
    test_db_session.query(Report).delete(synchronize_session=False)
    test_db_session.query(Department).delete(synchronize_session=False)
    test_db_session.query(Site).delete(synchronize_session=False)
    test_db_session.commit()


def _uid():
    return uuid.uuid4().hex[:6].upper()


class TestCreateReport:
    def test_create_minimal(self, test_db_session, svc):
        report = svc.create_report(
            db=test_db_session,
            report_text="Worker slipped near the drilling rig safely",
            report_type="unsafe_act",
        )
        assert report.id is not None
        assert report.report_text == "Worker slipped near the drilling rig safely"
        assert report.report_type == "unsafe_act"
        assert report.is_synthetic is False
        assert report.label_source == "user"
        assert report.date == date.today()

    def test_create_with_site_and_dept(self, test_db_session, svc):
        u = _uid()
        report = svc.create_report(
            db=test_db_session,
            report_text="Near miss during well stimulation work",
            report_type="near_miss",
            site=f"Digboi_{u}",
            department=f"Drilling_{u}",
            report_date=date(2025, 6, 15),
            hazard_type="slip_trip_fall",
            work_type="well_stimulation",
            is_synthetic=True,
        )
        assert report.site_id is not None
        assert report.dept_id is not None
        assert report.is_synthetic is True
        assert report.label_source == "synthetic"
        assert report.date == date(2025, 6, 15)

    def test_create_reuses_existing_site(self, test_db_session, svc):
        u = _uid()
        r1 = svc.create_report(db=test_db_session, report_text="text one for site reuse test", report_type="unsafe_act", site=f"Sibsagar_{u}")
        r2 = svc.create_report(db=test_db_session, report_text="text two for site reuse test", report_type="unsafe_act", site=f"Sibsagar_{u}")
        assert r1.site_id == r2.site_id

    def test_create_reuses_existing_dept(self, test_db_session, svc):
        u = _uid()
        r1 = svc.create_report(db=test_db_session, report_text="text one for dept reuse test", report_type="unsafe_act", site=f"A_{u}", department=f"Mechanical_{u}")
        r2 = svc.create_report(db=test_db_session, report_text="text two for dept reuse test", report_type="unsafe_act", site=f"B_{u}", department=f"Mechanical_{u}")
        assert r1.dept_id == r2.dept_id


class TestGetReport:
    def test_get_existing(self, test_db_session, svc):
        report = svc.create_report(db=test_db_session, report_text="get test report text content here", report_type="unsafe_act")
        found = svc.get_report(test_db_session, report.id)
        assert found is not None
        assert found.id == report.id

    def test_get_nonexistent(self, test_db_session, svc):
        found = svc.get_report(test_db_session, 99999)
        assert found is None


class TestListReports:
    def test_list_empty(self, test_db_session, svc):
        result = svc.list_reports(test_db_session)
        assert result["reports"] == []
        assert result["total"] == 0

    def test_list_with_data(self, test_db_session, svc):
        u = _uid()
        svc.create_report(db=test_db_session, report_text=f"list report one text content {u}", report_type="unsafe_act", site=f"XSite_{u}")
        svc.create_report(db=test_db_session, report_text=f"list report two text content {u}", report_type="near_miss", site=f"YSite_{u}")
        result = svc.list_reports(test_db_session)
        assert result["total"] == 2
        assert len(result["reports"]) == 2

    def test_list_pagination(self, test_db_session, svc):
        u = _uid()
        for i in range(5):
            svc.create_report(db=test_db_session, report_text=f"pagination report text number {i} {u}", report_type="unsafe_act")
        result = svc.list_reports(test_db_session, page=1, limit=2)
        assert len(result["reports"]) == 2
        assert result["total"] == 5
        assert result["page"] == 1

    def test_list_filter_by_site(self, test_db_session, svc):
        u = _uid()
        svc.create_report(db=test_db_session, report_text=f"filter site report one text {u}", report_type="unsafe_act", site=f"Alpha_{u}")
        svc.create_report(db=test_db_session, report_text=f"filter site report two text {u}", report_type="unsafe_act", site=f"Beta_{u}")
        site = test_db_session.query(Site).filter(Site.name == f"Alpha_{u}").first()
        result = svc.list_reports(test_db_session, site_id=site.id)
        assert result["total"] == 1

    def test_list_filter_by_dept(self, test_db_session, svc):
        u = _uid()
        svc.create_report(db=test_db_session, report_text=f"filter dept report one text {u}", report_type="unsafe_act", site=f"Slate_{u}", department=f"Alpha_{u}")
        svc.create_report(db=test_db_session, report_text=f"filter dept report two text {u}", report_type="unsafe_act", site=f"Slate_{u}", department=f"Beta_{u}")
        dept = test_db_session.query(Department).filter(Department.name == f"Alpha_{u}").first()
        result = svc.list_reports(test_db_session, dept_id=dept.id)
        assert result["total"] == 1


class TestDeleteReport:
    def test_delete_existing(self, test_db_session, svc):
        report = svc.create_report(db=test_db_session, report_text="delete this report text content", report_type="unsafe_act")
        assert svc.delete_report(test_db_session, report.id) is True
        assert svc.get_report(test_db_session, report.id) is None

    def test_delete_nonexistent(self, test_db_session, svc):
        assert svc.delete_report(test_db_session, 99999) is False

    def test_delete_cascades_predictions(self, test_db_session, svc):
        report = svc.create_report(db=test_db_session, report_text="cascade predictions test text", report_type="unsafe_act")
        pred = Prediction(report_id=report.id, risk_level="HIGH", confidence_score=0.9)
        test_db_session.add(pred)
        test_db_session.commit()
        svc.delete_report(test_db_session, report.id)
        assert test_db_session.query(Prediction).filter(Prediction.report_id == report.id).count() == 0

    def test_delete_cascades_alerts(self, test_db_session, svc):
        report = svc.create_report(db=test_db_session, report_text="cascade alerts test text content", report_type="unsafe_act")
        alert = Alert(report_id=report.id, risk_level="HIGH", alert_type="test", status="open")
        test_db_session.add(alert)
        test_db_session.commit()
        svc.delete_report(test_db_session, report.id)
        assert test_db_session.query(Alert).filter(Alert.report_id == report.id).count() == 0
