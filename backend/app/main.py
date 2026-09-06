"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.health import router as health_router
from app.api.v1.analyze import router as analyze_router
from app.api.v1.reports import router as reports_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.model import router as model_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.database.session import init_db

logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup and shutdown events."""
    logger.info("Starting %s v%s", settings.APP_NAME, settings.APP_VERSION)
    init_db()
    logger.info("Database initialized")

    from app.ml.pipeline import prediction_service
    prediction_service.load_model()
    if prediction_service.is_loaded:
        logger.info("ML model loaded successfully")
    else:
        logger.warning("ML model not loaded — using rule-based predictions")

    from app.database.session import SessionLocal
    import app.models
    from app.models.report import Report
    from app.models.site import Site
    from app.models.department import Department
    import json
    from pathlib import Path

    DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "synthetic" / "synthetic_reports.json"

    db = SessionLocal()
    existing = db.query(Report).count()
    if existing == 0 and DATA_PATH.exists():
        logger.info("Database empty — seeding with synthetic reports...")
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        reports = data["reports"] if isinstance(data, dict) else data
        for r in reports:
            site_q = db.query(Site).filter(Site.name == r["site"]).first()
            if not site_q:
                site_q = Site(name=r["site"], code=r["site"].replace(" ", "_").upper()[:20], location="Assam, India")
                db.add(site_q)
                db.flush()
            dept_q = db.query(Department).filter(Department.site_id == site_q.id, Department.name == r["department"]).first()
            if not dept_q:
                dept_q = Department(site_id=site_q.id, name=r["department"], code=f"{site_q.code}_{r['department'].replace(' ', '_').upper()}"[:50])
                db.add(dept_q)
                db.flush()
            report = Report(
                report_text=r["report_text"],
                report_type=r["report_type"],
                site_id=site_q.id,
                dept_id=dept_q.id,
                is_synthetic=str(r.get("is_synthetic", "true")).lower() == "true",
                hazard_type=r.get("hazard_type"),
                work_type=r.get("work_type"),
            )
            db.add(report)
        db.commit()
        total = db.query(Report).count()
        logger.info("Seeded %d reports into database", total)
    else:
        logger.info("Database has %d reports — skipping seed", existing)
    db.close()

    yield
    logger.info("Shutting down %s", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI/NLP Engine to Detect SIF Precursors in Safety Reports",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": "Resource not found"})

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error("Internal server error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

API_PREFIX = "/api/v1"
app.include_router(health_router, tags=["health"])
app.include_router(analyze_router, prefix=API_PREFIX, tags=["analyze"])
app.include_router(reports_router, prefix=API_PREFIX, tags=["reports"])
app.include_router(analytics_router, prefix=API_PREFIX, tags=["analytics"])
app.include_router(alerts_router, prefix=API_PREFIX, tags=["alerts"])
app.include_router(model_router, prefix=API_PREFIX, tags=["model"])


@app.get("/", tags=["root"])
def root():
    """Root endpoint with application metadata."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }
