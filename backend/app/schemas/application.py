from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel


class VerifyRequest(BaseModel):
    citizen_id: str


class DepartmentResult(BaseModel):
    department: str
    status: str
    data: Optional[Any] = None
    error: Optional[str] = None
    response_time_ms: Optional[float] = None


class EligibilityResult(BaseModel):
    is_eligible: bool
    reasons: List[str]


class MismatchInfo(BaseModel):
    detected: bool
    field: Optional[str] = None
    source_a: Optional[str] = None
    source_b: Optional[str] = None
    similarity_score: Optional[float] = None
    recommendation: Optional[str] = None


class VerificationResponse(BaseModel):
    application_id: str
    citizen_id: str
    service: str
    status: str
    citizen_verification: DepartmentResult
    education_verification: DepartmentResult
    income_verification: DepartmentResult
    welfare_verification: DepartmentResult
    eligibility: Optional[EligibilityResult] = None
    mismatch: Optional[MismatchInfo] = None
    processing_time_ms: Optional[float] = None
    verified_at: Optional[datetime] = None
    errors: List[str] = []


class ApplicationSummary(BaseModel):
    application_id: str
    citizen_id: str
    service_type: str
    status: str
    eligibility_result: Optional[str] = None
    created_at: datetime
    processing_time_ms: Optional[float] = None

    model_config = {"from_attributes": True}


class AuditLogOut(BaseModel):
    id: int
    timestamp: datetime
    application_id: Optional[str] = None
    username: Optional[str] = None
    service: str
    department: str
    endpoint: str
    purpose: str
    status: str
    response_time_ms: Optional[float] = None
    citizen_id: Optional[str] = None
    error_message: Optional[str] = None

    model_config = {"from_attributes": True}


class SystemStatusOut(BaseModel):
    department_key: str
    department_name: str
    status: str
    simulated_delay_ms: int
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_response_time_ms: Optional[float] = None
    last_success_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SystemStatusUpdate(BaseModel):
    status: str
    simulated_delay_ms: Optional[int] = 0
