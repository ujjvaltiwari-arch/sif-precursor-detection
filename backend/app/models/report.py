"""Report ORM model."""

from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    site_id: Mapped[int | None] = mapped_column(ForeignKey("sites.id"))
    dept_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"))
    report_text: Mapped[str] = mapped_column(Text)
    report_type: Mapped[str] = mapped_column(String(50))
    date: Mapped[date] = mapped_column(Date)
    hazard_type: Mapped[str | None] = mapped_column(String(100))
    work_type: Mapped[str | None] = mapped_column(String(100))
    language: Mapped[str] = mapped_column(String(10), default="en")
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)
    label_source: Mapped[str] = mapped_column(String(50), default="synthetic")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    site = relationship("Site", back_populates="reports")
    department = relationship("Department", back_populates="reports")
    prediction = relationship("Prediction", back_populates="report", uselist=False)
    alerts = relationship("Alert", back_populates="report")
