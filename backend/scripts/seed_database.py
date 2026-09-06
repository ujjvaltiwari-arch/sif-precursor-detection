"""Seed the database with synthetic reports."""

import json
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database.session import SessionLocal, init_db
import app.models  # noqa: F401 — register all models
from app.models.report import Report
from app.models.site import Site
from app.models.department import Department

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "synthetic" / "synthetic_reports.json"


def get_or_create_site(db, site_name: str) -> Site:
    site = db.query(Site).filter(Site.name == site_name).first()
    if not site:
        code = site_name.replace(" ", "_").upper()[:20]
        site = Site(name=site_name, code=code, location="Assam, India")
        db.add(site)
        db.flush()
    return site


def get_or_create_dept(db, site: Site, dept_name: str) -> Department:
    dept = db.query(Department).filter(
        Department.site_id == site.id, Department.name == dept_name
    ).first()
    if not dept:
        code = f"{site.code}_{dept_name.replace(' ', '_').upper()}"[:50]
        dept = Department(site_id=site.id, name=dept_name, code=code)
        db.add(dept)
        db.flush()
    return dept


def parse_date(d: str) -> date:
    try:
        return date.fromisoformat(d)
    except (ValueError, TypeError):
        return date(2024, 1, 1)


def seed():
    init_db()
    db = SessionLocal()

    existing = db.query(Report).count()
    if existing > 0:
        print(f"Database already has {existing} reports. Skipping seed.")
        db.close()
        return

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    reports = data["reports"] if isinstance(data, dict) else data

    print(f"Loading {len(reports)} synthetic reports...")

    for r in reports:
        site = get_or_create_site(db, r["site"])
        dept = get_or_create_dept(db, site, r["department"])

        report = Report(
            report_text=r["report_text"],
            report_type=r["report_type"],
            date=parse_date(r.get("date", "2024-01-01")),
            site_id=site.id,
            dept_id=dept.id,
            is_synthetic=str(r.get("is_synthetic", "true")).lower() == "true",
            label_source=r.get("label_source", "synthetic"),
            hazard_type=r.get("hazard_type"),
            work_type=r.get("work_type"),
            language=r.get("language", "en"),
        )
        db.add(report)

    db.commit()
    total = db.query(Report).count()
    print(f"Seeded {total} reports into database.")
    db.close()


if __name__ == "__main__":
    seed()
