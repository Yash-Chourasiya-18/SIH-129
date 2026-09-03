"""
Orchestration Engine
Coordinates the full scholarship verification workflow:
1. Call all 4 department APIs concurrently
2. Handle failures without crashing
3. Normalize each response to internal schema
4. Run mismatch detection (AI-assisted, local fallback)
5. Run deterministic eligibility rules
6. Persist results and audit logs
"""
import asyncio
import time
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.integration.gateway import call_department
from app.integration.normalizer import (
    normalize_citizen,
    normalize_education,
    normalize_revenue,
    normalize_welfare,
)
from app.integration.eligibility import evaluate_eligibility
from app.models.application import Application
from app.models.audit_log import AuditLog
from app.models.system_status import SystemStatus


def _similarity_score(s1: str, s2: str) -> float:
    """
    Local offline name similarity using Levenshtein distance ratio.
    No external API required — works completely offline.
    """
    s1 = s1.lower().strip()
    s2 = s2.lower().strip()
    if s1 == s2:
        return 1.0

    len1, len2 = len(s1), len(s2)
    if len1 == 0 or len2 == 0:
        return 0.0

    # Build Levenshtein distance matrix
    dp = [[0] * (len2 + 1) for _ in range(len1 + 1)]
    for i in range(len1 + 1):
        dp[i][0] = i
    for j in range(len2 + 1):
        dp[0][j] = j

    for i in range(1, len1 + 1):
        for j in range(1, len2 + 1):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            dp[i][j] = min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost)

    distance = dp[len1][len2]
    max_len = max(len1, len2)
    return round(1 - distance / max_len, 4)


def _detect_mismatch(citizen_name: str, education_name: str) -> dict:
    """
    Compare the name from Citizen Registry against the name in Education records.
    This is the AI-assisted feature — uses local similarity, not an external API.
    """
    score = _similarity_score(citizen_name, education_name)

    if score >= 0.95:
        recommendation = "AUTO_APPROVE"
        detected = False
    elif score >= 0.75:
        recommendation = "MANUAL_REVIEW"
        detected = True
    else:
        recommendation = "REJECT"
        detected = True

    return {
        "detected": detected,
        "field": "name",
        "source_a": f"Citizen Registry: '{citizen_name}'",
        "source_b": f"Education Dept: '{education_name}'",
        "similarity_score": score,
        "recommendation": recommendation,
    }


async def _write_audit_log(
    db: AsyncSession,
    application_id: str,
    user_id: Optional[int],
    username: Optional[str],
    dept_result: dict,
    citizen_id: str,
    service: str = "Scholarship Verification",
):
    log = AuditLog(
        application_id=application_id,
        user_id=user_id,
        username=username,
        service=service,
        department=dept_result["department_name"],
        endpoint=f"/mock/{dept_result['department']}/{citizen_id}",
        purpose=dept_result["purpose"],
        http_method="GET",
        status=dept_result["status"],
        status_code=200 if dept_result["status"] == "SUCCESS" else 503,
        response_time_ms=dept_result.get("response_time_ms"),
        citizen_id=citizen_id,
        error_message=dept_result.get("error"),
    )
    db.add(log)


async def _update_system_stats(db: AsyncSession, dept_key: str, result: dict):
    """Update running stats for the system health dashboard."""
    row = await db.execute(
        select(SystemStatus).where(SystemStatus.department_key == dept_key)
    )
    status_row = row.scalar_one_or_none()
    if not status_row:
        return

    status_row.total_requests = (status_row.total_requests or 0) + 1
    if result["status"] == "SUCCESS":
        status_row.successful_requests = (status_row.successful_requests or 0) + 1
        status_row.last_success_at = datetime.now(timezone.utc)
        # Update rolling average
        prev_avg = status_row.avg_response_time_ms or 0
        n = status_row.successful_requests
        rt = result.get("response_time_ms") or 0
        status_row.avg_response_time_ms = round(prev_avg + (rt - prev_avg) / n, 2)
    else:
        status_row.failed_requests = (status_row.failed_requests or 0) + 1


async def orchestrate_scholarship(
    citizen_id: str,
    user_id: int,
    username: str,
    db: AsyncSession,
    existing_application_id: Optional[str] = None,
) -> dict:
    """
    Full scholarship verification workflow.
    If existing_application_id is given, it's a retry of a failed application.
    """
    application_id = existing_application_id or str(uuid.uuid4())
    start_time = time.perf_counter()

    # Create/update application record
    if existing_application_id:
        await db.execute(
            update(Application)
            .where(Application.application_id == existing_application_id)
            .values(status="PROCESSING")
        )
    else:
        app = Application(
            application_id=application_id,
            citizen_id=citizen_id,
            service_type="SCHOLARSHIP_VERIFICATION",
            submitted_by=user_id,
            status="PROCESSING",
        )
        db.add(app)

    await db.commit()

    # --- Call all 4 departments concurrently ---
    citizen_task = call_department("citizen", citizen_id, db)
    education_task = call_department("education", citizen_id, db)
    revenue_task = call_department("revenue", citizen_id, db)
    welfare_task = call_department("welfare", citizen_id, db)

    citizen_result, education_result, revenue_result, welfare_result = await asyncio.gather(
        citizen_task, education_task, revenue_task, welfare_task
    )

    # --- Write audit logs for each call ---
    for result in [citizen_result, education_result, revenue_result, welfare_result]:
        await _write_audit_log(db, application_id, user_id, username, result, citizen_id)

    # --- Update system stats ---
    for dept_key, result in [
        ("citizen", citizen_result),
        ("education", education_result),
        ("revenue", revenue_result),
        ("welfare", welfare_result),
    ]:
        await _update_system_stats(db, dept_key, result)

    await db.commit()

    # --- Determine overall status ---
    all_results = [citizen_result, education_result, revenue_result, welfare_result]
    failed = [r for r in all_results if r["status"] not in ("SUCCESS",)]
    success = [r for r in all_results if r["status"] == "SUCCESS"]

    errors = [r["error"] for r in failed if r.get("error")]

    # --- Normalize successful responses ---
    citizen_normalized = None
    education_normalized = None
    revenue_normalized = None
    welfare_normalized = None

    if citizen_result["status"] == "SUCCESS":
        citizen_normalized = normalize_citizen(citizen_result["data"], citizen_id).model_dump()

    if education_result["status"] == "SUCCESS":
        education_normalized = normalize_education(education_result["data"], citizen_id).model_dump()

    if revenue_result["status"] == "SUCCESS":
        revenue_normalized = normalize_revenue(revenue_result["data"], citizen_id).model_dump()

    if welfare_result["status"] == "SUCCESS":
        welfare_normalized = normalize_welfare(welfare_result["data"], citizen_id).model_dump()

    # --- Mismatch detection (AI feature — local similarity, no API key) ---
    mismatch_info = None
    if citizen_normalized and education_normalized:
        citizen_name = citizen_normalized.get("full_name", "")
        education_name = education_result["data"].get("student_name", "")
        mismatch_info = _detect_mismatch(citizen_name, education_name)

    # --- Run eligibility (only if all critical data available) ---
    eligibility = None
    overall_status = "COMPLETED"

    if revenue_result["status"] != "SUCCESS" or citizen_result["status"] != "SUCCESS":
        overall_status = "PARTIAL_FAILURE"
    
    if all(r["status"] == "SUCCESS" for r in all_results):
        from app.schemas.normalized import NormalizedIncomeData, NormalizedEducationData, NormalizedWelfareData
        elig = evaluate_eligibility(
            NormalizedIncomeData(**revenue_normalized),
            NormalizedEducationData(**education_normalized),
            NormalizedWelfareData(**welfare_normalized),
        )
        eligibility = elig
        overall_status = "COMPLETED"
    elif failed:
        overall_status = "PARTIAL_FAILURE"

    # Mismatch blocks auto-approval even if eligible
    eligibility_result_str = None
    if eligibility:
        if eligibility["is_eligible"]:
            if mismatch_info and mismatch_info.get("recommendation") == "REJECT":
                eligibility_result_str = "PENDING_REVIEW"
            else:
                eligibility_result_str = "ELIGIBLE"
        else:
            eligibility_result_str = "NOT_ELIGIBLE"
    elif overall_status == "PARTIAL_FAILURE":
        eligibility_result_str = "PENDING"

    total_ms = round((time.perf_counter() - start_time) * 1000, 2)

    # --- Persist final application state ---
    await db.execute(
        update(Application)
        .where(Application.application_id == application_id)
        .values(
            status=overall_status,
            citizen_data=citizen_normalized,
            education_data=education_normalized,
            revenue_data=revenue_normalized,
            welfare_data=welfare_normalized,
            citizen_status=citizen_result["status"],
            education_status=education_result["status"],
            revenue_status=revenue_result["status"],
            welfare_status=welfare_result["status"],
            eligibility_result=eligibility_result_str,
            eligibility_reasons=eligibility.get("reasons") if eligibility else None,
            mismatch_detected=str(mismatch_info.get("detected", False)).lower() if mismatch_info else "false",
            mismatch_details=mismatch_info,
            errors=errors if errors else None,
            processing_time_ms=total_ms,
        )
    )
    await db.commit()

    return {
        "application_id": application_id,
        "citizen_id": citizen_id,
        "service": "SCHOLARSHIP_VERIFICATION",
        "status": overall_status,
        "citizen_verification": citizen_result,
        "education_verification": education_result,
        "income_verification": revenue_result,
        "welfare_verification": welfare_result,
        "normalized": {
            "citizen": citizen_normalized,
            "education": education_normalized,
            "income": revenue_normalized,
            "welfare": welfare_normalized,
        },
        "mismatch": mismatch_info,
        "eligibility": eligibility,
        "eligibility_result": eligibility_result_str,
        "processing_time_ms": total_ms,
        "verified_at": datetime.now(timezone.utc).isoformat(),
        "errors": errors,
    }
