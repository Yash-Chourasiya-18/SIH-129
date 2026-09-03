"""
API Gateway Layer
Calls each mock department system with proper authentication headers.
Handles timeouts, errors, and simulated outages gracefully.
Reads system status from DB to simulate OFFLINE / SLOW modes.
"""
import asyncio
import time
import httpx
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.system_status import SystemStatus


DEPT_CONFIG = {
    "citizen": {
        "name": "Citizen Registry",
        "base_url": settings.CITIZEN_REGISTRY_URL,
        "path": "/mock/citizen/{citizen_id}",
        "purpose": "Identity Verification",
    },
    "education": {
        "name": "Education Department",
        "base_url": settings.EDUCATION_DEPT_URL,
        "path": "/mock/education/{citizen_id}",
        "purpose": "Academic Record Verification",
    },
    "revenue": {
        "name": "Revenue Department",
        "base_url": settings.REVENUE_DEPT_URL,
        "path": "/mock/revenue/{citizen_id}",
        "purpose": "Income Certificate Verification",
    },
    "welfare": {
        "name": "Welfare Department",
        "base_url": settings.WELFARE_DEPT_URL,
        "path": "/mock/welfare/{citizen_id}",
        "purpose": "Welfare Scheme Eligibility Check",
    },
}


async def get_dept_status(db: AsyncSession, dept_key: str) -> Optional[SystemStatus]:
    result = await db.execute(
        select(SystemStatus).where(SystemStatus.department_key == dept_key)
    )
    return result.scalar_one_or_none()


async def call_department(
    dept_key: str,
    citizen_id: str,
    db: AsyncSession,
    timeout: float = 10.0,
) -> dict:
    """
    Call a mock department API through the gateway.
    Returns a structured response: { status, data, error, response_time_ms }
    """
    config = DEPT_CONFIG[dept_key]
    dept_status = await get_dept_status(db, dept_key)

    # --- Check if department is OFFLINE ---
    if dept_status and dept_status.status == "OFFLINE":
        return {
            "department": dept_key,
            "department_name": config["name"],
            "purpose": config["purpose"],
            "status": "OFFLINE",
            "data": None,
            "error": f"{config['name']} is currently offline (simulated outage)",
            "response_time_ms": 0,
        }

    # --- Apply SLOW mode delay ---
    simulated_delay = 0
    if dept_status and dept_status.status == "SLOW":
        simulated_delay = dept_status.simulated_delay_ms or 2000
        await asyncio.sleep(simulated_delay / 1000)

    url = config["base_url"] + config["path"].format(citizen_id=citizen_id)
    headers = {
        "X-MahaSetu-Key": settings.INTERNAL_API_KEY,
        "X-Service": "MahaSetu-Orchestrator",
        "X-Purpose": config["purpose"],
    }

    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(url, headers=headers)

        elapsed_ms = (time.perf_counter() - start) * 1000 + simulated_delay

        if response.status_code == 200:
            return {
                "department": dept_key,
                "department_name": config["name"],
                "purpose": config["purpose"],
                "status": "SUCCESS",
                "data": response.json(),
                "error": None,
                "response_time_ms": round(elapsed_ms, 2),
            }
        elif response.status_code == 404:
            return {
                "department": dept_key,
                "department_name": config["name"],
                "purpose": config["purpose"],
                "status": "NOT_FOUND",
                "data": None,
                "error": f"Citizen {citizen_id} not found in {config['name']}",
                "response_time_ms": round(elapsed_ms, 2),
            }
        else:
            return {
                "department": dept_key,
                "department_name": config["name"],
                "purpose": config["purpose"],
                "status": "FAILED",
                "data": None,
                "error": f"HTTP {response.status_code} from {config['name']}",
                "response_time_ms": round(elapsed_ms, 2),
            }

    except httpx.TimeoutException:
        elapsed_ms = (time.perf_counter() - start) * 1000
        return {
            "department": dept_key,
            "department_name": config["name"],
            "purpose": config["purpose"],
            "status": "TIMEOUT",
            "data": None,
            "error": f"Request to {config['name']} timed out after {timeout}s",
            "response_time_ms": round(elapsed_ms, 2),
        }
    except Exception as e:
        elapsed_ms = (time.perf_counter() - start) * 1000
        return {
            "department": dept_key,
            "department_name": config["name"],
            "purpose": config["purpose"],
            "status": "FAILED",
            "data": None,
            "error": str(e),
            "response_time_ms": round(elapsed_ms, 2),
        }
