"""Batch-analyze all seeded reports to populate predictions."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import app.models  # noqa: F401
from app.database.session import SessionLocal
from app.models.report import Report
from app.ml.pipeline import prediction_service
from app.ml.explainability import explainability_service
from app.models.prediction import Prediction
from app.models.prediction_category import PredictionCategory
from app.models.precursor_category import PrecursorCategory
from app.models.missing_control import MissingControl
from app.models.alert import Alert


def batch_analyze():
    prediction_service.load_model()
    if not prediction_service.is_loaded:
        print("ERROR: Model not loaded")
        return

    try:
        explainability_service.initialize(
            model=prediction_service.model.classifier if prediction_service.model else None,
            feature_extractor=prediction_service.model.feature_extractor if prediction_service.model else None,
            class_labels=prediction_service.model.get_class_labels() if prediction_service.model else ["HIGH", "MEDIUM", "LOW"],
        )
    except Exception as e:
        print(f"Warning: Explainability init failed ({e}), using keyword fallback")

    db = SessionLocal()
    reports = db.query(Report).filter(Report.id.notin_(
        db.query(Prediction.report_id)
    )).all()

    if not reports:
        print("All reports already analyzed.")
        db.close()
        return

    print(f"Analyzing {len(reports)} reports...")
    success = 0
    for i, report in enumerate(reports):
        try:
            analysis = prediction_service.analyze(report.report_text)

            explanation_data = explainability_service.explain(
                text=report.report_text,
                risk_level=analysis["risk_level"],
                confidence=analysis["confidence_score"],
                detected_hazards=analysis["detected_hazards"],
                missing_controls=analysis["missing_controls"],
            )

            prediction = Prediction(
                report_id=report.id,
                risk_level=analysis["risk_level"],
                confidence_score=analysis["confidence_score"],
                explanation=explanation_data.get("explanation", ""),
                review_priority=analysis["review_priority"],
                model_name=prediction_service.model_name,
                model_version=prediction_service.model_version,
            )
            db.add(prediction)
            db.flush()

            for precursor in analysis["detected_precursors"]:
                cat = db.query(PrecursorCategory).filter(PrecursorCategory.name == precursor["name"]).first()
                if not cat:
                    cat = PrecursorCategory(name=precursor["name"])
                    db.add(cat)
                    db.flush()
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

            if analysis["risk_level"] == "HIGH":
                alert = Alert(
                    report_id=report.id,
                    risk_level="HIGH",
                    alert_type="sif_precursor_detected",
                    status="open",
                )
                db.add(alert)

            success += 1
            if (i + 1) % 50 == 0:
                db.commit()
                print(f"  Processed {i + 1}/{len(reports)}")
        except Exception as e:
            print(f"  Error on report {report.id}: {e}")

    db.commit()

    total_predictions = db.query(Prediction).count()
    total_alerts = db.query(Alert).count()
    print(f"Done. {success} analyzed, {total_predictions} predictions, {total_alerts} alerts.")
    db.close()


if __name__ == "__main__":
    batch_analyze()
