"""
Data Normalization Layer
Transforms four department raw responses (each with different JSON schemas)
into the unified MahaSetu internal data model.

This is the core interoperability demonstration — each transform function
documents exactly which field maps to which.
"""
from typing import Optional
from app.schemas.normalized import (
    NormalizedCitizenData,
    NormalizedEducationData,
    NormalizedIncomeData,
    NormalizedWelfareData,
)


def normalize_citizen(raw: dict, citizen_id: str) -> NormalizedCitizenData:
    """
    Citizen Registry Schema → Internal Schema
    Raw:  citizen_id, full_name, district_name, date_of_birth, gender, aadhaar_linked
    """
    return NormalizedCitizenData(
        citizen_id=raw.get("citizen_id", citizen_id),
        full_name=raw.get("full_name", ""),
        district=raw.get("district_name", ""),           # district_name → district
        date_of_birth=raw.get("date_of_birth"),
        gender=raw.get("gender"),
        aadhaar_linked=raw.get("aadhaar_linked"),
    )


def normalize_education(raw: dict, citizen_id: str) -> NormalizedEducationData:
    """
    Education Dept Schema → Internal Schema
    Raw:  student_id, student_name, institution_name, course_name, year_of_study,
          percentage, academic_year
    """
    return NormalizedEducationData(
        citizen_id=citizen_id,
        student_id=raw.get("student_id", citizen_id),
        college_name=raw.get("institution_name", ""),     # institution_name → college_name
        course=raw.get("course_name", ""),                # course_name → course
        year_of_study=raw.get("year_of_study", 1),
        percentage=float(raw.get("percentage", 0)),
        academic_year=raw.get("academic_year", ""),
    )


def normalize_revenue(raw: dict, citizen_id: str) -> NormalizedIncomeData:
    """
    Revenue Dept Schema → Internal Schema
    Raw:  id, applicant_name, income_yearly, certificate_no, issuing_tahsildar, valid_till
    Note: 'id' → citizen_id, 'income_yearly' → annual_income, 'certificate_no' → income_certificate_no
    """
    return NormalizedIncomeData(
        citizen_id=raw.get("id", citizen_id),              # id → citizen_id
        annual_income=float(raw.get("income_yearly", 0)), # income_yearly → annual_income
        income_certificate_no=raw.get("certificate_no", ""),  # certificate_no → income_certificate_no
        issuing_authority=raw.get("issuing_tahsildar"),
        valid_upto=raw.get("valid_till"),
    )


def normalize_welfare(raw: dict, citizen_id: str) -> NormalizedWelfareData:
    """
    Welfare Dept Schema → Internal Schema
    Raw:  beneficiary_id, registered_name, scheme_name, already_received, category
    Note: 'beneficiary_id' → citizen_id, 'already_received' → already_received_benefit
    """
    return NormalizedWelfareData(
        citizen_id=raw.get("beneficiary_id", citizen_id),       # beneficiary_id → citizen_id
        scheme_name=raw.get("scheme_name", ""),
        already_received_benefit=raw.get("already_received", False),  # already_received → already_received_benefit
        category=raw.get("category"),
    )
