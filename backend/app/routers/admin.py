from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.security import require_roles
from app.models.audit_log import AuditLog
from app.models.system_status import SystemStatus
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/audit-logs")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    department: str = Query(None),
    status: str = Query(None),
    application_id: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("officer", "admin")),
):
    query = select(AuditLog).order_by(desc(AuditLog.timestamp))
    if department:
        query = query.where(AuditLog.department.ilike(f"%{department}%"))
    if status:
        query = query.where(AuditLog.status == status.upper())
    if application_id:
        query = query.where(AuditLog.application_id == application_id)

    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    logs = result.scalars().all()

    return [
        {
            "id": l.id,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None,
            "application_id": l.application_id,
            "username": l.username,
            "service": l.service,
            "department": l.department,
            "endpoint": l.endpoint,
            "purpose": l.purpose,
            "status": l.status,
            "response_time_ms": l.response_time_ms,
            "citizen_id": l.citizen_id,
            "error_message": l.error_message,
        }
        for l in logs
    ]


@router.get("/system-status")
async def get_system_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("officer", "admin")),
):
    result = await db.execute(select(SystemStatus))
    rows = result.scalars().all()
    return [
        {
            "department_key": r.department_key,
            "department_name": r.department_name,
            "status": r.status,
            "simulated_delay_ms": r.simulated_delay_ms,
            "total_requests": r.total_requests,
            "successful_requests": r.successful_requests,
            "failed_requests": r.failed_requests,
            "avg_response_time_ms": r.avg_response_time_ms,
            "last_success_at": r.last_success_at.isoformat() if r.last_success_at else None,
        }
        for r in rows
    ]


@router.patch("/system-status/{dept_key}")
async def update_system_status(
    dept_key: str,
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "officer")),
):
    result = await db.execute(
        select(SystemStatus).where(SystemStatus.department_key == dept_key)
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail=f"Department '{dept_key}' not found")

    new_status = body.get("status", "ONLINE").upper()
    if new_status not in ("ONLINE", "OFFLINE", "SLOW"):
        raise HTTPException(status_code=422, detail="Status must be ONLINE, OFFLINE, or SLOW")

    row.status = new_status
    row.simulated_delay_ms = body.get("simulated_delay_ms", 0) if new_status == "SLOW" else 0
    await db.commit()

    return {
        "department_key": row.department_key,
        "department_name": row.department_name,
        "status": row.status,
        "simulated_delay_ms": row.simulated_delay_ms,
        "message": f"{row.department_name} status updated to {row.status}",
    }
