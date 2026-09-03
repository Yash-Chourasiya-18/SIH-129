"""
Mock Department API Endpoints
These simulate independent government department systems.
In a real deployment, each would be a completely separate microservice/system.
Protected by internal API key (X-MahaSetu-Key header).
"""
import asyncio
from fastapi import APIRouter, HTTPException, Header, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.models.system_status import SystemStatus
from app.mock_systems import citizen_registry, education_dept, revenue_dept, welfare_dept

router = APIRouter(prefix="/mock", tags=["Mock Department APIs"])


def _verify_internal(x_mahasetu_key: str = Header(default="")):
    if x_mahasetu_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid internal API key")


async def _check_status(db: AsyncSession, dept_key: str):
    """Check if department is online — raises 503 if offline."""
    result = await db.execute(
        select(SystemStatus).where(SystemStatus.department_key == dept_key)
    )
    row = result.scalar_one_or_none()
    if row and row.status == "OFFLINE":
        raise HTTPException(status_code=503, detail=f"Department is currently offline (simulated outage)")
    if row and row.status == "SLOW" and row.simulated_delay_ms:
        await asyncio.sleep(row.simulated_delay_ms / 1000)


@router.get("/citizen/{citizen_id}")
async def get_citizen(
    citizen_id: str,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(_verify_internal),
):
    """Citizen Registry System API — returns its own schema."""
    await _check_status(db, "citizen")
    data = citizen_registry.get_citizen(citizen_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Citizen {citizen_id} not found in registry")
    return data


@router.get("/education/{citizen_id}")
async def get_education(
    citizen_id: str,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(_verify_internal),
):
    """Education Department API — returns its own schema (student_id, percentage, institution_name)."""
    await _check_status(db, "education")
    data = education_dept.get_education(citizen_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Student {citizen_id} not found in Education records")
    return data


@router.get("/revenue/{citizen_id}")
async def get_revenue(
    citizen_id: str,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(_verify_internal),
):
    """Revenue Department API — returns its own schema (id, income_yearly, certificate_no)."""
    await _check_status(db, "revenue")
    data = revenue_dept.get_revenue(citizen_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Revenue record not found for {citizen_id}")
    return data


@router.get("/welfare/{citizen_id}")
async def get_welfare(
    citizen_id: str,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(_verify_internal),
):
    """Welfare Department API — returns its own schema (beneficiary_id, already_received)."""
    await _check_status(db, "welfare")
    data = welfare_dept.get_welfare(citizen_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Welfare record not found for {citizen_id}")
    return data
