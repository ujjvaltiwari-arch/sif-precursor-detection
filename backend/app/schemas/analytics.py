"""Pydantic schemas for analytics data."""

from pydantic import BaseModel


class OverviewResponse(BaseModel):
    total_reports: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    most_common_precursor: str
    highest_risk_site: str
    highest_risk_department: str
    recent_alerts_count: int
