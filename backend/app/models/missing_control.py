"""MissingControl ORM model."""

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class MissingControl(Base):
    __tablename__ = "missing_controls"

    id: Mapped[int] = mapped_column(primary_key=True)
    prediction_id: Mapped[int] = mapped_column(ForeignKey("predictions.id"))
    control_name: Mapped[str] = mapped_column(String(200))
    control_category: Mapped[str | None] = mapped_column(String(100))
    detected_via: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    severity: Mapped[str | None] = mapped_column(String(20))

    prediction = relationship("Prediction", back_populates="missing_controls")
