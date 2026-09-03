from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.core.rate_limit import check_rate_limit
from app.models.user import User
from app.models.application import Application
from app.integration.orchestrator import orchestrate_scholarship

router = APIRouter(prefix="/api/services", tags=["Services"])


@router.post("/scholarship/verify")
async def verify_scholarship(
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("citizen", "officer", "admin")),
):
    citizen_id = body.get("citizen_id", "").strip().upper()
    if not citizen_id:
        raise HTTPException(status_code=422, detail="citizen_id is required")

    # Rate limiting per user
    check_rate_limit(f"scholarship:{current_user.id}")

    # Citizens can only verify their own ID
    if current_user.role == "citizen" and current_user.citizen_id != citizen_id:
        raise HTTPException(
            status_code=403,
            detail="Citizens can only verify their own scholarship eligibility",
        )

    result = await orchestrate_scholarship(
        citizen_id=citizen_id,
        user_id=current_user.id,
        username=current_user.username,
        db=db,
    )
    return result


@router.post("/scholarship/retry/{application_id}")
async def retry_scholarship(
    application_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("citizen", "officer", "admin")),
):
    # Fetch the existing application
    result = await db.execute(
        select(Application).where(Application.application_id == application_id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app.status not in ("PARTIAL_FAILURE", "FAILED"):
        raise HTTPException(
            status_code=400,
            detail=f"Application status is '{app.status}'. Retry is only for failed applications.",
        )

    # Citizens can only retry their own applications
    if current_user.role == "citizen" and app.submitted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    result = await orchestrate_scholarship(
        citizen_id=app.citizen_id,
        user_id=current_user.id,
        username=current_user.username,
        db=db,
        existing_application_id=application_id,
    )
    return result


@router.get("/scholarship/{application_id}")
async def get_application(
    application_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Application).where(Application.application_id == application_id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Citizens can only view their own
    if current_user.role == "citizen" and app.submitted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return {
        "application_id": app.application_id,
        "citizen_id": app.citizen_id,
        "service_type": app.service_type,
        "status": app.status,
        "citizen_status": app.citizen_status,
        "education_status": app.education_status,
        "revenue_status": app.revenue_status,
        "welfare_status": app.welfare_status,
        "eligibility_result": app.eligibility_result,
        "eligibility_reasons": app.eligibility_reasons,
        "mismatch_detected": app.mismatch_detected,
        "mismatch_details": app.mismatch_details,
        "normalized_data": {
            "citizen": app.citizen_data,
            "education": app.education_data,
            "income": app.revenue_data,
            "welfare": app.welfare_data,
        },
        "errors": app.errors,
        "processing_time_ms": app.processing_time_ms,
        "created_at": app.created_at.isoformat() if app.created_at else None,
    }
