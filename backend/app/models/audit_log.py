from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    application_id = Column(String(36), nullable=True, index=True)
    user_id = Column(Integer, nullable=True)
    username = Column(String(50), nullable=True)

    service = Column(String(100), nullable=False)        # e.g. "Scholarship Verification"
    department = Column(String(100), nullable=False)     # e.g. "Revenue Department"
    endpoint = Column(String(200), nullable=False)       # e.g. "/mock/revenue/MH1001"
    purpose = Column(String(200), nullable=False)        # e.g. "Income Verification"
    http_method = Column(String(10), nullable=False, default="GET")

    status = Column(String(20), nullable=False)          # SUCCESS, FAILED, TIMEOUT
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Float, nullable=True)

    citizen_id = Column(String(20), nullable=True)
    error_message = Column(String(500), nullable=True)

    def __repr__(self):
        return f"<AuditLog {self.department} {self.status} @ {self.timestamp}>"
