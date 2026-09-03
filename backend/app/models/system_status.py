from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class SystemStatus(Base):
    __tablename__ = "system_status"

    id = Column(Integer, primary_key=True, index=True)
    department_key = Column(String(50), unique=True, nullable=False)  # citizen, education, revenue, welfare
    department_name = Column(String(100), nullable=False)
    # ONLINE, OFFLINE, SLOW
    status = Column(String(20), nullable=False, default="ONLINE")
    simulated_delay_ms = Column(Integer, nullable=False, default=0)  # for SLOW mode

    total_requests = Column(Integer, nullable=False, default=0)
    successful_requests = Column(Integer, nullable=False, default=0)
    failed_requests = Column(Integer, nullable=False, default=0)
    avg_response_time_ms = Column(Float, nullable=True)
    last_success_at = Column(DateTime(timezone=True), nullable=True)

    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<SystemStatus {self.department_key} [{self.status}]>"
