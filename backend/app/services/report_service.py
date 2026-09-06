"""Report CRUD service."""

import logging
from datetime import date
from typing import Any, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.department import Department
from app.models.prediction import Prediction
from app.models.report import Report
from app.models.site import Site

logger = logging.getLogger(__name__)


class ReportService:
    """Handle report CRUD operations."""

    def create_report(
        self,
        db: Session,
        report_text: str,
        report_type: str,
        site: str | None = None,
        department: str | None = None,
        report_date: date | None = None,
        hazard_type: str | None = None,
        work_type: str | None = None,
        is_synthetic: bool = False,
    ) -> Report:
        site_id = self._get_or_create_site(db, site) if site else None
        dept_id = self._get_or_create_department(db, department, site_id) if department else None

        report = Report(
            report_text=report_text,
            report_type=report_type,
            site_id=site_id,
            dept_id=dept_id,
            date=report_date or date.today(),
            hazard_type=hazard_type,
            work_type=work_type,
            is_synthetic=is_synthetic,
            label_source="synthetic" if is_synthetic else "user",
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    def get_report(self, db: Session, report_id: int) -> Report | None:
        return db.query(Report).filter(Report.id == report_id).first()

    def list_reports(
        self,
        db: Session,
        page: int = 1,
        limit: int = 20,
        risk_level: str | None = None,
        site_id: int | None = None,
        dept_id: int | None = None,
    ) -> dict[str, Any]:
        query = db.query(Report)

        if site_id:
            query = query.filter(Report.site_id == site_id)
        if dept_id:
            query = query.filter(Report.dept_id == dept_id)

        total = query.count()
        reports = query.order_by(Report.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

        if risk_level:
            report_ids = [r.id for r in reports]
            predictions = db.query(Prediction).filter(
                Prediction.report_id.in_(report_ids),
                Prediction.risk_level == risk_level,
            ).all()
            pred_report_ids = {p.report_id for p in predictions}
            reports = [r for r in reports if r.id in pred_report_ids]

        enriched = []
        for report in reports:
            site = db.query(Site).filter(Site.id == report.site_id).first() if report.site_id else None
            dept = db.query(Department).filter(Department.id == report.dept_id).first() if report.dept_id else None
            prediction = db.query(Prediction).filter(Prediction.report_id == report.id).first()

            enriched.append({
                "id": report.id,
                "report_text": report.report_text,
                "report_type": report.report_type,
                "site": site.name if site else None,
                "department": dept.name if dept else None,
                "date": report.date.isoformat() if report.date else None,
                "hazard_type": report.hazard_type,
                "work_type": report.work_type,
                "is_synthetic": report.is_synthetic,
                "created_at": report.created_at.isoformat() if report.created_at else None,
                "prediction": {
                    "id": prediction.id,
                    "risk_level": prediction.risk_level,
                    "confidence_score": prediction.confidence_score,
                    "explanation": prediction.explanation,
                    "review_priority": prediction.review_priority,
                    "created_at": prediction.created_at.isoformat() if prediction.created_at else None,
                } if prediction else None,
            })

        return {"reports": enriched, "total": total, "page": page, "limit": limit}

    def delete_report(self, db: Session, report_id: int) -> bool:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            return False
        db.query(Prediction).filter(Prediction.report_id == report_id).delete()
        db.query(Alert).filter(Alert.report_id == report_id).delete()
        db.delete(report)
        db.commit()
        return True

    def _get_or_create_site(self, db: Session, name: str) -> int:
        site = db.query(Site).filter(Site.name == name).first()
        if site:
            return site.id
        site = Site(name=name, code=name[:3].upper())
        db.add(site)
        db.commit()
        db.refresh(site)
        return site.id

    def _get_or_create_department(self, db: Session, name: str, site_id: int | None) -> int:
        dept = db.query(Department).filter(Department.name == name).first()
        if dept:
            return dept.id
        dept = Department(name=name, code=name[:3].upper(), site_id=site_id)
        db.add(dept)
        db.commit()
        db.refresh(dept)
        return dept.id


report_service = ReportService()
