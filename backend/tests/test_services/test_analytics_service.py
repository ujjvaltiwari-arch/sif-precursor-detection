"""Tests for AnalyticsService."""

import pytest
from datetime import date

from app.models.alert import Alert
from app.models.department import Department
from app.models.missing_control import MissingControl
from app.models.precursor_category import PrecursorCategory
from app.models.prediction import Prediction
from app.models.prediction_category import PredictionCategory
from app.models.report import Report
from app.models.site import Site
from app.services.analytics_service import AnalyticsService


@pytest.fixture
def svc():
    return AnalyticsService()


@pytest.fixture(autouse=True)
def clean_db(test_db_session):
    test_db_session.rollback()
    test_db_session.query(MissingControl).delete(synchronize_session=False)
    test_db_session.query(PredictionCategory).delete(synchronize_session=False)
    test_db_session.query(PrecursorCategory).delete(synchronize_session=False)
    test_db_session.query(Alert).delete(synchronize_session=False)
    test_db_session.query(Prediction).delete(synchronize_session=False)
    test_db_session.query(Report).delete(synchronize_session=False)
    test_db_session.query(Department).delete(synchronize_session=False)
    test_db_session.query(Site).delete(synchronize_session=False)
    test_db_session.commit()
    yield
    test_db_session.rollback()
    test_db_session.query(MissingControl).delete(synchronize_session=False)
    test_db_session.query(PredictionCategory).delete(synchronize_session=False)
    test_db_session.query(PrecursorCategory).delete(synchronize_session=False)
    test_db_session.query(Alert).delete(synchronize_session=False)
    test_db_session.query(Prediction).delete(synchronize_session=False)
    test_db_session.query(Report).delete(synchronize_session=False)
    test_db_session.query(Department).delete(synchronize_session=False)
    test_db_session.query(Site).delete(synchronize_session=False)
    test_db_session.commit()


@pytest.fixture
def seeded_db(test_db_session):
    import uuid
    uid = str(uuid.uuid4())[:8]

    site = Site(name=f"Digboi_{uid}", code=f"DIG{uid[:3].upper()}")
    test_db_session.add(site)
    test_db_session.commit()
    test_db_session.refresh(site)

    dept = Department(name=f"Drilling_{uid}", code=f"DRI{uid[:3].upper()}", site_id=site.id)
    test_db_session.add(dept)
    test_db_session.commit()
    test_db_session.refresh(dept)

    report = Report(
        report_text="Worker fell from height working", report_type="unsafe_act",
        site_id=site.id, dept_id=dept.id, hazard_type="working_at_height",
        date=date.today(),
    )
    test_db_session.add(report)
    test_db_session.commit()
    test_db_session.refresh(report)

    cat = PrecursorCategory(name=f"Working at Height {uid}")
    test_db_session.add(cat)
    test_db_session.commit()
    test_db_session.refresh(cat)

    pred = Prediction(report_id=report.id, risk_level="HIGH", confidence_score=0.92)
    test_db_session.add(pred)
    test_db_session.commit()
    test_db_session.refresh(pred)

    link = PredictionCategory(prediction_id=pred.id, category_id=cat.id, confidence=0.9)
    test_db_session.add(link)
    test_db_session.commit()

    mc = MissingControl(prediction_id=pred.id, control_name=f"Fall Protection {uid}", control_category="PPE")
    test_db_session.add(mc)
    test_db_session.commit()

    alert = Alert(report_id=report.id, risk_level="HIGH", alert_type="sif_precursor_detected", status="open")
    test_db_session.add(alert)
    test_db_session.commit()

    return {"site": site, "dept": dept, "report": report, "pred": pred, "cat": cat, "alert": alert, "uid": uid}


class TestGetOverview:
    def test_overview_counts(self, test_db_session, svc, seeded_db):
        result = svc.get_overview(test_db_session)
        assert result["total_reports"] >= 1
        assert result["high_risk_count"] >= 1

    def test_overview_most_common_precursor(self, test_db_session, svc, seeded_db):
        result = svc.get_overview(test_db_session)
        assert "Working at Height" in result["most_common_precursor"]

    def test_overview_highest_risk_site(self, test_db_session, svc, seeded_db):
        result = svc.get_overview(test_db_session)
        assert seeded_db["site"].name in result["highest_risk_site"]

    def test_overview_highest_risk_dept(self, test_db_session, svc, seeded_db):
        result = svc.get_overview(test_db_session)
        assert seeded_db["dept"].name in result["highest_risk_department"]

    def test_overview_open_alerts(self, test_db_session, svc, seeded_db):
        result = svc.get_overview(test_db_session)
        assert result["recent_alerts_count"] >= 1

    def test_overview_empty_db(self, test_db_session, svc):
        result = svc.get_overview(test_db_session)
        assert result["total_reports"] == 0
        assert result["most_common_precursor"] == "N/A"
        assert result["highest_risk_site"] == "N/A"


class TestPrecursorTrends:
    def test_trends(self, test_db_session, svc, seeded_db):
        result = svc.get_precursor_trends(test_db_session)
        matching = [r for r in result if seeded_db["uid"][:3].upper() in r["name"] or "Working at Height" in r["name"]]
        assert len(matching) >= 1


class TestRiskDistribution:
    def test_distribution(self, test_db_session, svc, seeded_db):
        result = svc.get_risk_distribution(test_db_session)
        assert "HIGH" in result
        assert result["HIGH"] >= 1


class TestDepartmentTrends:
    def test_dept_trends(self, test_db_session, svc, seeded_db):
        result = svc.get_department_trends(test_db_session)
        matching = [r for r in result if seeded_db["dept"].name in r["name"]]
        assert len(matching) == 1
        assert matching[0]["HIGH"] >= 1


class TestSiteTrends:
    def test_site_trends(self, test_db_session, svc, seeded_db):
        result = svc.get_site_trends(test_db_session)
        matching = [r for r in result if seeded_db["site"].name in r["name"]]
        assert len(matching) == 1
        assert matching[0]["HIGH"] >= 1


class TestRecurringHazards:
    def test_hazards(self, test_db_session, svc, seeded_db):
        result = svc.get_recurring_hazards(test_db_session)
        assert any(r["hazard"] == "working_at_height" for r in result)


class TestMissingControlTrends:
    def test_controls(self, test_db_session, svc, seeded_db):
        result = svc.get_missing_control_trends(test_db_session)
        matching = [r for r in result if seeded_db["uid"][:3].upper() in r["control"] or "Fall Protection" in r["control"]]
        assert len(matching) >= 1
