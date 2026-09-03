"""
Normalized internal schema — the common model after transforming all four
department API responses into a unified structure.
"""
from typing import Optional
from pydantic import BaseModel


class NormalizedCitizenData(BaseModel):
    citizen_id: str
    full_name: str
    district: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    aadhaar_linked: Optional[bool] = None


class NormalizedEducationData(BaseModel):
    citizen_id: str
    student_id: str
    college_name: str
    course: str
    year_of_study: int
    percentage: float
    academic_year: str


class NormalizedIncomeData(BaseModel):
    citizen_id: str
    annual_income: float
    income_certificate_no: str
    issuing_authority: Optional[str] = None
    valid_upto: Optional[str] = None


class NormalizedWelfareData(BaseModel):
    citizen_id: str
    scheme_name: str
    already_received_benefit: bool
    category: Optional[str] = None


class MismatchResult(BaseModel):
    detected: bool
    field: str
    source_a: str
    source_b: str
    similarity_score: float
    recommendation: str  # "AUTO_APPROVE" | "MANUAL_REVIEW" | "REJECT"
