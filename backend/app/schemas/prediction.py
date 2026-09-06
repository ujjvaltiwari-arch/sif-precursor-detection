"""Pydantic schemas for prediction data."""

from typing import Optional

from pydantic import BaseModel


class PrecursorOut(BaseModel):
    name: str
    confidence: float


class MissingControlOut(BaseModel):
    control: str
    category: str


class AnalysisResult(BaseModel):
    risk_level: str
    confidence_score: float
    review_priority: int
    detected_precursors: list[PrecursorOut]
    detected_hazards: list[str]
    missing_controls: list[MissingControlOut]
    explanation: str
    important_phrases: list[str]


class AnalyzeRequest(BaseModel):
    report_text: str
    report_type: str
    site: Optional[str] = None
    department: Optional[str] = None
    date: Optional[str] = None


class AnalyzeResponse(BaseModel):
    report_id: int
    analysis: AnalysisResult
