"""Analytics endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.analytics_service import analytics_service

router = APIRouter()


@router.get("/analytics/overview")
def get_overview(db: Session = Depends(get_db)):
    """Get dashboard overview statistics."""
    return analytics_service.get_overview(db)


@router.get("/analytics/trends")
def get_trends(period: str = "30d", db: Session = Depends(get_db)):
    """Get analytics trends."""
    return {
        "precursor_trends": analytics_service.get_precursor_trends(db),
        "risk_distribution": analytics_service.get_risk_distribution(db),
        "department_trends": analytics_service.get_department_trends(db),
        "site_trends": analytics_service.get_site_trends(db),
        "recurring_hazards": analytics_service.get_recurring_hazards(db),
        "missing_control_trends": analytics_service.get_missing_control_trends(db),
    }


@router.get("/analytics/heatmap")
def get_heatmap(db: Session = Depends(get_db)):
    """Get site risk heatmap data."""
    from app.models.site import Site
    from app.models.report import Report
    from app.models.prediction import Prediction
    from sqlalchemy import func

    results = (
        db.query(
            Site.name,
            Site.latitude,
            Site.longitude,
            func.count(Prediction.id).label("risk_count"),
        )
        .join(Report, Site.id == Report.site_id)
        .join(Prediction, Report.id == Prediction.report_id)
        .filter(Prediction.risk_level == "HIGH")
        .group_by(Site.id)
        .all()
    )

    sites = []
    for r in results:
        sites.append({
            "name": r[0],
            "lat": r[1],
            "lng": r[2],
            "risk_count": r[3],
        })

    return {"sites": sites}
