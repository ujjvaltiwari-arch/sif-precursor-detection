"""Prediction ORM model."""

from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"))
    risk_level: Mapped[str] = mapped_column(String(10))
    confidence_score: Mapped[float] = mapped_column(Float)
    explanation: Mapped[str | None] = mapped_column(Text)
    review_priority: Mapped[int] = mapped_column(Integer, default=0)
    model_version: Mapped[str | None] = mapped_column(String(50))
    model_name: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    report = relationship("Report", back_populates="prediction")
    categories = relationship("PredictionCategory", back_populates="prediction")
    missing_controls = relationship("MissingControl", back_populates="prediction")
