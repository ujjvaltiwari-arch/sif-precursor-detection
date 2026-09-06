"""Pydantic schemas for report data."""

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    report_text: str = Field(..., min_length=10, max_length=10000)
    report_type: str = Field(..., pattern=r"^(unsafe_act|unsafe_condition|near_miss)$")
    site: Optional[str] = None
    department: Optional[str] = None
    date: Optional[date] = None
    hazard_type: Optional[str] = None
    work_type: Optional[str] = None


class ReportResponse(BaseModel):
    id: int
    report_text: str
    report_type: str
    site: Optional[str]
    department: Optional[str]
    date: Optional[date]
    hazard_type: Optional[str]
    work_type: Optional[str]
    is_synthetic: bool
    created_at: str

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    reports: list[ReportResponse]
    total: int
    page: int
    limit: int
