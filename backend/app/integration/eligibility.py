"""
Deterministic Scholarship Eligibility Engine

Rules (as specified):
  1. Annual income < 250,000
  2. Academic percentage >= 60
  3. No previous scholarship benefit received

AI/ML is NOT used for the eligibility decision.
The mismatch detection (in orchestrator.py) uses similarity scoring but
does NOT influence the eligibility outcome — it only flags for manual review.
"""
from app.schemas.normalized import (
    NormalizedIncomeData,
    NormalizedEducationData,
    NormalizedWelfareData,
)


INCOME_THRESHOLD = 250_000   # Annual family income ceiling
MARKS_THRESHOLD = 60.0       # Minimum academic percentage


def evaluate_eligibility(
    income_data: NormalizedIncomeData,
    education_data: NormalizedEducationData,
    welfare_data: NormalizedWelfareData,
) -> dict:
    """
    Run deterministic eligibility rules.
    Returns: { is_eligible: bool, reasons: list[str] }
    """
    reasons = []
    passed = []

    # Rule 1: Income check
    if income_data.annual_income < INCOME_THRESHOLD:
        passed.append(f"Annual income ₹{income_data.annual_income:,.0f} is below the limit of ₹{INCOME_THRESHOLD:,.0f}")
    else:
        reasons.append(
            f"Annual income ₹{income_data.annual_income:,.0f} exceeds the maximum limit of ₹{INCOME_THRESHOLD:,.0f}"
        )

    # Rule 2: Marks check
    if education_data.percentage >= MARKS_THRESHOLD:
        passed.append(f"Academic percentage {education_data.percentage}% meets the minimum requirement of {MARKS_THRESHOLD}%")
    else:
        reasons.append(
            f"Academic percentage {education_data.percentage}% is below the minimum requirement of {MARKS_THRESHOLD}%"
        )

    # Rule 3: Prior benefit check
    if not welfare_data.already_received_benefit:
        passed.append("No previous scholarship benefit received")
    else:
        reasons.append("Applicant has already received a scholarship benefit for this scheme")

    is_eligible = len(reasons) == 0

    if is_eligible:
        return {
            "is_eligible": True,
            "reasons": passed,
        }
    else:
        return {
            "is_eligible": False,
            "reasons": reasons,
        }
