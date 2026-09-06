"""PredictionCategory junction ORM model."""

from sqlalchemy import Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class PredictionCategory(Base):
    __tablename__ = "prediction_categories"

    prediction_id: Mapped[int] = mapped_column(
        ForeignKey("predictions.id"), primary_key=True
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("precursor_categories.id"), primary_key=True
    )
    confidence: Mapped[float] = mapped_column(Float, default=0.0)

    prediction = relationship("Prediction", back_populates="categories")
    category = relationship("PrecursorCategory", back_populates="prediction_links")
