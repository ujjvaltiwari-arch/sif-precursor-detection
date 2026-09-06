"""Custom exception classes for the application."""


class SIFDetectionError(Exception):
    """Base exception for SIF Detection system."""

    def __init__(self, message: str, code: str = "UNKNOWN_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class ModelNotLoadedError(SIFDetectionError):
    """Raised when ML model is not available."""

    def __init__(self, message: str = "ML model is not loaded"):
        super().__init__(message, code="MODEL_NOT_LOADED")


class ReportNotFoundError(SIFDetectionError):
    """Raised when a report is not found."""

    def __init__(self, report_id: int):
        super().__init__(f"Report {report_id} not found", code="REPORT_NOT_FOUND")


class ValidationError(SIFDetectionError):
    """Raised on data validation failure."""

    def __init__(self, message: str):
        super().__init__(message, code="VALIDATION_ERROR")


class DatabaseError(SIFDetectionError):
    """Raised on database operation failure."""

    def __init__(self, message: str = "Database operation failed"):
        super().__init__(message, code="DATABASE_ERROR")


class FileUploadError(SIFDetectionError):
    """Raised on file upload failure."""

    def __init__(self, message: str = "File upload failed"):
        super().__init__(message, code="FILE_UPLOAD_ERROR")
