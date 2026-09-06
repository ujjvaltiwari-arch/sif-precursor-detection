"""Alert management service."""

import logging
from typing import Any

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.report import Report

logger = logging.getLogger(__name__)


class AlertService:
    """Manage safety alerts."""

    def list_alerts(
        self,
        db: Session,
        status: str | None = None,
        risk_level: str | None = None,
    ) -> list[dict[str, Any]]:
        query = db.query(Alert)
        if status:
            query = query.filter(Alert.status == status)
        if risk_level:
            query = query.filter(Alert.risk_level == risk_level)
        alerts = query.order_by(Alert.created_at.desc()).all()

        result = []
        for alert in alerts:
            report = db.query(Report).filter(Report.id == alert.report_id).first()
            result.append({
                "id": alert.id,
                "report_id": alert.report_id,
                "report_text": report.report_text[:100] + "..." if report and len(report.report_text) > 100 else (report.report_text if report else ""),
                "risk_level": alert.risk_level,
                "alert_type": alert.alert_type,
                "status": alert.status,
                "assigned_to": alert.assigned_to,
                "notes": alert.notes,
                "created_at": alert.created_at.isoformat() if alert.created_at else None,
                "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
            })
        return result

    def acknowledge(self, db: Session, alert_id: int) -> Alert | None:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return None
        alert.status = "acknowledged"
        db.commit()
        db.refresh(alert)
        return alert

    def resolve(self, db: Session, alert_id: int, notes: str | None = None) -> Alert | None:
        from datetime import datetime, timezone
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return None
        alert.status = "resolved"
        alert.resolved_at = datetime.now(timezone.utc)
        if notes:
            alert.notes = notes
        db.commit()
        db.refresh(alert)
        return alert

    def dismiss(self, db: Session, alert_id: int) -> Alert | None:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return None
        alert.status = "dismissed"
        db.commit()
        db.refresh(alert)
        return alert


alert_service = AlertService()
