"""Health check endpoint."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db

router = APIRouter()

_start_time = datetime.now(timezone.utc)


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint returning service status."""
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        pass

    uptime = (datetime.now(timezone.utc) - _start_time).total_seconds()

    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "model_loaded": False,
        "database_connected": db_connected,
        "uptime_seconds": round(uptime, 2),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
