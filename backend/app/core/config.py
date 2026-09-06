"""Application configuration using Pydantic Settings."""

from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Application
    APP_NAME: str = "SIF Precursor Detection"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "sqlite:///./sif_detection.db"

    # ML Model
    MODEL_STAGE: str = "baseline"  # baseline | transformer
    MODEL_PATH: str = "models/baseline"
    CONFIDENCE_THRESHOLD: float = 0.5
    HIGH_RISK_THRESHOLD: float = 0.7
    MEDIUM_RISK_THRESHOLD: float = 0.4

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://10.30.252.39:5173",
        "http://10.30.252.39:8000",
    ]

    # Logging
    LOG_LEVEL: str = "INFO"

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 10

    # Synthetic Data
    SYNTHETIC_DATA_PATH: str = "data/synthetic"


settings = Settings()


def get_settings() -> Settings:
    """Get application settings instance."""
    return settings
