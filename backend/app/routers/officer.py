from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.core.security import require_roles
from app.models.application import Application
from app.models.user import User

router = APIRouter(prefix="/api/officer", tags=["Officer"])


@router.get("/applications")
async def list_applications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    citizen_id: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("officer", "admin")),
):
    query = select(Application).order_by(desc(Application.created_at))
    if status:
        query = query.where(Application.status == status.upper())
    if citizen_id:
        query = query.where(Application.citizen_id == citizen_id.upper())

    # Count total
    count_result = await db.execute(select(func.count()).select_from(Application))
    total = count_result.scalar()

    # Paginate
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    apps = result.scalars().all()

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": [
            {
                "application_id": a.application_id,
                "citizen_id": a.citizen_id,
                "service_type": a.service_type,
                "status": a.status,
                "eligibility_result": a.eligibility_result,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "processing_time_ms": a.processing_time_ms,
                "citizen_status": a.citizen_status,
                "education_status": a.education_status,
                "revenue_status": a.revenue_status,
                "welfare_status": a.welfare_status,
            }
            for a in apps
        ],
    }


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("officer", "admin")),
):
    total = (await db.execute(select(func.count()).select_from(Application))).scalar()
    completed = (
        await db.execute(
            select(func.count()).select_from(Application).where(Application.status == "COMPLETED")
        )
    ).scalar()
    partial = (
        await db.execute(
            select(func.count()).select_from(Application).where(Application.status == "PARTIAL_FAILURE")
        )
    ).scalar()
    eligible = (
        await db.execute(
            select(func.count()).select_from(Application).where(Application.eligibility_result == "ELIGIBLE")
        )
    ).scalar()
    not_eligible = (
        await db.execute(
            select(func.count()).select_from(Application).where(Application.eligibility_result == "NOT_ELIGIBLE")
        )
    ).scalar()

    return {
        "total_applications": total,
        "completed": completed,
        "partial_failure": partial,
        "eligible": eligible,
        "not_eligible": not_eligible,
        "pending": total - completed - partial,
    }
