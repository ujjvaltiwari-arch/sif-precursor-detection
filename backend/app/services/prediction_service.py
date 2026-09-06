"""Prediction service — orchestrates ML analysis and stores results."""

import logging
from datetime import date
from typing import Any

from sqlalchemy.orm import Session

from app.ml.explainability import explainability_service
from app.ml.pipeline import prediction_service
from app.models.alert import Alert
from app.models.department import Department
from app.models.prediction import Prediction
from app.models.prediction_category import PredictionCategory
from app.models.precursor_category import PrecursorCategory
from app.models.missing_control import MissingControl
from app.models.report import Report
from app.models.site import Site

logger = logging.getLogger(__name__)


class PredictionService:
    """Analyze reports and store predictions."""

    def __init__(self):
        self._initialized = False

    def initialize(self, db: Session | None = None) -> None:
        """Load model and initialize explainability."""
        if self._initialized:
            return
        prediction_service.load_model()
        if db:
            explainability_service.initialize(
                model=prediction_service.model.classifier if prediction_service.model else None,
                feature_extractor=prediction_service.model.feature_extractor if prediction_service.model else None,
                class_labels=prediction_service.model.get_class_labels() if prediction_service.model else ["HIGH", "MEDIUM", "LOW"],
            )
        self._initialized = True
        logger.info("Prediction service initialized")

    def analyze_and_store(
        self,
        db: Session,
        report_text: str,
        report_type: str,
        site: str | None = None,
        department: str | None = None,
        report_date: str | None = None,
    ) -> dict[str, Any]:
        """Full analysis pipeline: analyze → store → return."""
        self.initialize(db)

        from app.services.report_service import report_service
        parsed_date = date.fromisoformat(report_date) if report_date else date.today()
        report = report_service.create_report(
            db=db,
            report_text=report_text,
            report_type=report_type,
            site=site,
            department=department,
            report_date=parsed_date,
        )

        analysis = prediction_service.analyze(report_text)

        explanation_data = explainability_service.explain(
            text=report_text,
            risk_level=analysis["risk_level"],
            confidence=analysis["confidence_score"],
            detected_hazards=analysis["detected_hazards"],
            missing_controls=analysis["missing_controls"],
        )

        prediction = Prediction(
            report_id=report.id,
            risk_level=analysis["risk_level"],
            confidence_score=analysis["confidence_score"],
            explanation=explanation_data["explanation"],
            review_priority=analysis["review_priority"],
            model_name=prediction_service.model_name,
            model_version=prediction_service.model_version,
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        for precursor in analysis["detected_precursors"]:
            cat = self._get_or_create_category(db, precursor["name"])
            link = PredictionCategory(
                prediction_id=prediction.id,
                category_id=cat.id,
                confidence=precursor["confidence"],
            )
            db.add(link)

        for ctrl in analysis["missing_controls"]:
            mc = MissingControl(
                prediction_id=prediction.id,
                control_name=ctrl["control"],
                control_category=ctrl.get("category", ""),
                detected_via="inference",
            )
            db.add(mc)

        db.commit()

        if analysis["risk_level"] == "HIGH":
            alert = Alert(
                report_id=report.id,
                risk_level="HIGH",
                alert_type="sif_precursor_detected",
                status="open",
            )
            db.add(alert)
            db.commit()

        site_obj = db.query(Site).filter(Site.id == report.site_id).first() if report.site_id else None
        dept_obj = db.query(Department).filter(Department.id == report.dept_id).first() if report.dept_id else None

        return {
            "report_id": report.id,
            "analysis": {
                "risk_level": analysis["risk_level"],
                "confidence_score": analysis["confidence_score"],
                "review_priority": analysis["review_priority"],
                "detected_precursors": analysis["detected_precursors"],
                "detected_hazards": analysis["detected_hazards"],
                "missing_controls": analysis["missing_controls"],
                "explanation": explanation_data["explanation"],
                "important_phrases": analysis["important_phrases"],
                "important_features": explanation_data.get("important_features", []),
                "methods_used": explanation_data.get("methods_used", []),
            },
            "site": site_obj.name if site_obj else site,
            "department": dept_obj.name if dept_obj else department,
        }

    def _get_or_create_category(self, db: Session, name: str) -> PrecursorCategory:
        cat = db.query(PrecursorCategory).filter(PrecursorCategory.name == name).first()
        if cat:
            return cat
        cat = PrecursorCategory(name=name)
        db.add(cat)
        db.commit()
        db.refresh(cat)
        return cat


prediction_svc = PredictionService()
