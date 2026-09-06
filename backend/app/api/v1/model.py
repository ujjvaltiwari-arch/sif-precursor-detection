"""Model info endpoint."""

from fastapi import APIRouter

from app.ml.pipeline import prediction_service

router = APIRouter()


@router.get("/model/info")
def get_model_info():
    """Get information about the current ML model."""
    info = {
        "current_model": prediction_service.model_name,
        "model_version": prediction_service.model_version,
        "model_loaded": prediction_service.is_loaded,
        "stage": "baseline",
    }

    if prediction_service.is_loaded and prediction_service.model:
        try:
            eval_results = prediction_service.model.evaluate(
                ["test"], ["LOW"], "info"
            )
            info["accuracy"] = eval_results.get("accuracy", 0)
        except Exception:
            pass

    return info
