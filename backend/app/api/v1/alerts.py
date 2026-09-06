"""Alert management endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.alert_service import alert_service

router = APIRouter()


@router.get("/alerts")
def list_alerts(
    status: str | None = None,
    risk_level: str | None = None,
    db: Session = Depends(get_db),
):
    """List alerts with optional filtering."""
    return alert_service.list_alerts(db, status=status, risk_level=risk_level)


@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    """Acknowledge an alert."""
    alert = alert_service.acknowledge(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return {"message": f"Alert {alert_id} acknowledged", "status": alert.status}


@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Resolve an alert."""
    alert = alert_service.resolve(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return {"message": f"Alert {alert_id} resolved", "status": alert.status}


@router.delete("/alerts/{alert_id}")
def dismiss_alert(alert_id: int, db: Session = Depends(get_db)):
    """Dismiss an alert."""
    alert = alert_service.dismiss(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return {"message": f"Alert {alert_id} dismissed"}
