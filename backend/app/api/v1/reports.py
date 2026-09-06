"""Report CRUD endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.report import ReportCreate, ReportListResponse
from app.services.report_service import report_service

router = APIRouter()


@router.get("/reports", response_model=ReportListResponse)
def list_reports(
    page: int = 1,
    limit: int = 20,
    risk_level: str | None = None,
    site: int | None = None,
    dept: int | None = None,
    db: Session = Depends(get_db),
):
    """List reports with optional filtering."""
    return report_service.list_reports(db, page=page, limit=limit, risk_level=risk_level, site_id=site, dept_id=dept)


@router.get("/reports/{report_id}")
def get_report(report_id: int, db: Session = Depends(get_db)):
    """Get a single report by ID."""
    report = report_service.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found")

    from app.models.site import Site
    from app.models.department import Department
    from app.models.prediction import Prediction

    site = db.query(Site).filter(Site.id == report.site_id).first() if report.site_id else None
    dept = db.query(Department).filter(Department.id == report.dept_id).first() if report.dept_id else None
    prediction = db.query(Prediction).filter(Prediction.report_id == report.id).first()

    return {
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
    }


@router.delete("/reports/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    """Delete a report."""
    deleted = report_service.delete_report(db, report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found")
    return {"message": f"Report {report_id} deleted"}
