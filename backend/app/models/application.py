from sqlalchemy import Column, Integer, String, JSON, DateTime, Float
from sqlalchemy.sql import func
from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(36), unique=True, index=True, nullable=False)
    citizen_id = Column(String(20), nullable=False, index=True)
    service_type = Column(String(50), nullable=False, default="SCHOLARSHIP_VERIFICATION")
    submitted_by = Column(Integer, nullable=False)  # user.id

    # Overall status: PENDING, PROCESSING, COMPLETED, FAILED, PARTIAL_FAILURE
    status = Column(String(30), nullable=False, default="PENDING")

    # Results from each department (raw normalized data)
    citizen_data = Column(JSON, nullable=True)
    education_data = Column(JSON, nullable=True)
    revenue_data = Column(JSON, nullable=True)
    welfare_data = Column(JSON, nullable=True)

    # Per-department status
    citizen_status = Column(String(20), nullable=True)
    education_status = Column(String(20), nullable=True)
    revenue_status = Column(String(20), nullable=True)
    welfare_status = Column(String(20), nullable=True)

    # Eligibility result
    eligibility_result = Column(String(20), nullable=True)  # ELIGIBLE, NOT_ELIGIBLE
    eligibility_reasons = Column(JSON, nullable=True)  # list of reason strings

    # Mismatch detection
    mismatch_detected = Column(String(10), nullable=True)  # true/false
    mismatch_details = Column(JSON, nullable=True)

    # Errors
    errors = Column(JSON, nullable=True)

    # Timing
    processing_time_ms = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Application {self.application_id} [{self.status}]>"
