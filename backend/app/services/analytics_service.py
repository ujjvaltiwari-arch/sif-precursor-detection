"""Analytics aggregation service."""

import logging
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.department import Department
from app.models.prediction import Prediction
from app.models.prediction_category import PredictionCategory
from app.models.precursor_category import PrecursorCategory
from app.models.report import Report
from app.models.site import Site

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Aggregate analytics data."""

    def get_overview(self, db: Session) -> dict[str, Any]:
        total_reports = db.query(Report).count()
        high_risk = db.query(Prediction).filter(Prediction.risk_level == "HIGH").count()
        medium_risk = db.query(Prediction).filter(Prediction.risk_level == "MEDIUM").count()
        low_risk = db.query(Prediction).filter(Prediction.risk_level == "LOW").count()

        most_common = (
            db.query(PrecursorCategory.name, func.count(PredictionCategory.category_id))
            .join(PredictionCategory, PrecursorCategory.id == PredictionCategory.category_id)
            .group_by(PrecursorCategory.name)
            .order_by(func.count(PredictionCategory.category_id).desc())
            .first()
        )

        highest_risk_site = (
            db.query(Site.name, func.count(Prediction.id))
            .join(Report, Site.id == Report.site_id)
            .join(Prediction, Report.id == Prediction.report_id)
            .filter(Prediction.risk_level == "HIGH")
            .group_by(Site.name)
            .order_by(func.count(Prediction.id).desc())
            .first()
        )

        highest_risk_dept = (
            db.query(Department.name, func.count(Prediction.id))
            .join(Report, Department.id == Report.dept_id)
            .join(Prediction, Report.id == Prediction.report_id)
            .filter(Prediction.risk_level == "HIGH")
            .group_by(Department.name)
            .order_by(func.count(Prediction.id).desc())
            .first()
        )

        open_alerts = db.query(Alert).filter(Alert.status == "open").count()

        return {
            "total_reports": total_reports,
            "high_risk_count": high_risk,
            "medium_risk_count": medium_risk,
            "low_risk_count": low_risk,
            "most_common_precursor": most_common[0] if most_common else "N/A",
            "highest_risk_site": highest_risk_site[0] if highest_risk_site else "N/A",
            "highest_risk_department": highest_risk_dept[0] if highest_risk_dept else "N/A",
            "recent_alerts_count": open_alerts,
        }

    def get_precursor_trends(self, db: Session) -> list[dict[str, Any]]:
        results = (
            db.query(PrecursorCategory.name, func.count(PredictionCategory.category_id))
            .join(PredictionCategory, PrecursorCategory.id == PredictionCategory.category_id)
            .group_by(PrecursorCategory.name)
            .order_by(func.count(PredictionCategory.category_id).desc())
            .all()
        )
        return [{"name": r[0], "count": r[1]} for r in results]

    def get_risk_distribution(self, db: Session) -> dict[str, int]:
        results = (
            db.query(Prediction.risk_level, func.count(Prediction.id))
            .group_by(Prediction.risk_level)
            .all()
        )
        return {r[0]: r[1] for r in results}

    def get_department_trends(self, db: Session) -> list[dict[str, Any]]:
        results = (
            db.query(Department.name, Prediction.risk_level, func.count(Prediction.id))
            .join(Report, Department.id == Report.dept_id)
            .join(Prediction, Report.id == Prediction.report_id)
            .group_by(Department.name, Prediction.risk_level)
            .all()
        )
        dept_data: dict[str, dict[str, int]] = {}
        for dept, risk, count in results:
            if dept not in dept_data:
                dept_data[dept] = {"name": dept, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
            dept_data[dept][risk] = count
        return list(dept_data.values())

    def get_site_trends(self, db: Session) -> list[dict[str, Any]]:
        results = (
            db.query(Site.name, Prediction.risk_level, func.count(Prediction.id))
            .join(Report, Site.id == Report.site_id)
            .join(Prediction, Report.id == Prediction.report_id)
            .group_by(Site.name, Prediction.risk_level)
            .all()
        )
        site_data: dict[str, dict[str, int]] = {}
        for site_name, risk, count in results:
            if site_name not in site_data:
                site_data[site_name] = {"name": site_name, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
            site_data[site_name][risk] = count
        return list(site_data.values())

    def get_recurring_hazards(self, db: Session) -> list[dict[str, Any]]:
        results = (
            db.query(Report.hazard_type, func.count(Report.id))
            .filter(Report.hazard_type.isnot(None))
            .group_by(Report.hazard_type)
            .order_by(func.count(Report.id).desc())
            .all()
        )
        return [{"hazard": r[0], "count": r[1]} for r in results]

    def get_missing_control_trends(self, db: Session) -> list[dict[str, Any]]:
        from app.models.missing_control import MissingControl
        results = (
            db.query(MissingControl.control_name, func.count(MissingControl.id))
            .group_by(MissingControl.control_name)
            .order_by(func.count(MissingControl.id).desc())
            .limit(10)
            .all()
        )
        return [{"control": r[0], "count": r[1]} for r in results]


analytics_service = AnalyticsService()
