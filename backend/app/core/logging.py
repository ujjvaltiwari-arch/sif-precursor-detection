"""Structured logging configuration."""

import logging
import sys
from typing import Any

from app.core.config import settings


def setup_logging() -> logging.Logger:
    """Configure structured logging for the application."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    logger = logging.getLogger("sif_detection")
    logger.setLevel(log_level)

    return logger


def get_logger(name: str) -> logging.Logger:
    """Get a named logger instance."""
    return logging.getLogger(f"sif_detection.{name}")
