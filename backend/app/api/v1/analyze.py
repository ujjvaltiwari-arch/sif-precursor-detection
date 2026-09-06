"""Analyze report endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.prediction import AnalyzeRequest, AnalyzeResponse
from app.services.prediction_service import prediction_svc

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_report(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """Analyze a safety report and return risk assessment with explanation."""
    result = prediction_svc.analyze_and_store(
        db=db,
        report_text=request.report_text,
        report_type=request.report_type,
        site=request.site,
        department=request.department,
        report_date=request.date,
    )
    return result
