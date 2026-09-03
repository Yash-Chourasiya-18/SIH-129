"""
Seed script — creates demo users and system status records.
Run once after DB initialization.
"""
import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, init_db
from app.core.security import hash_password
from app.models.user import User
from app.models.system_status import SystemStatus


DEMO_USERS = [
    # Citizens
    {"username": "rahul.sharma",   "full_name": "Rahul Sharma",   "role": "citizen", "citizen_id": "MH1001", "district": "Pune",       "password": "citizen123"},
    {"username": "priya.patil",    "full_name": "Priya Patil",    "role": "citizen", "citizen_id": "MH1002", "district": "Nashik",     "password": "citizen123"},
    {"username": "amit.desai",     "full_name": "Amit Desai",     "role": "citizen", "citizen_id": "MH1003", "district": "Mumbai",     "password": "citizen123"},
    {"username": "sneha.kulkarni", "full_name": "Sneha Kulkarni", "role": "citizen", "citizen_id": "MH1004", "district": "Aurangabad", "password": "citizen123"},
    {"username": "rohan.jadhav",   "full_name": "Rohan Jadhav",   "role": "citizen", "citizen_id": "MH1005", "district": "Kolhapur",   "password": "citizen123"},
    {"username": "meera.joshi",    "full_name": "Meera Joshi",    "role": "citizen", "citizen_id": "MH1006", "district": "Nagpur",     "password": "citizen123"},
    {"username": "kiran.shinde",   "full_name": "Kiran Shinde",   "role": "citizen", "citizen_id": "MH1007", "district": "Solapur",    "password": "citizen123"},
    {"username": "pooja.wagh",     "full_name": "Pooja Wagh",     "role": "citizen", "citizen_id": "MH1008", "district": "Thane",      "password": "citizen123"},
    {"username": "suresh.naik",    "full_name": "Suresh Naik",    "role": "citizen", "citizen_id": "MH1009", "district": "Ratnagiri",  "password": "citizen123"},
    {"username": "ananya.more",    "full_name": "Ananya More",    "role": "citizen", "citizen_id": "MH1010", "district": "Pune",       "password": "citizen123"},
    # Officers / Admin
    {"username": "officer.pune",   "full_name": "Officer Pune",   "role": "officer", "citizen_id": None, "district": "Pune",   "password": "officer123"},
    {"username": "admin",          "full_name": "System Admin",   "role": "admin",   "citizen_id": None, "district": None,     "password": "admin123"},
]

DEPARTMENTS = [
    {"department_key": "citizen",   "department_name": "Citizen Registry"},
    {"department_key": "education", "department_name": "Education Department"},
    {"department_key": "revenue",   "department_name": "Revenue Department"},
    {"department_key": "welfare",   "department_name": "Welfare Department"},
]


async def seed():
    print("Initializing database tables...")
    await init_db()

    async with AsyncSessionLocal() as db:
        # Seed users
        for u in DEMO_USERS:
            existing = await db.execute(select(User).where(User.username == u["username"]))
            if existing.scalar_one_or_none():
                print(f"  [skip] User '{u['username']}' already exists")
                continue
            user = User(
                username=u["username"],
                full_name=u["full_name"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
                citizen_id=u["citizen_id"],
                district=u["district"],
                is_active=True,
            )
            db.add(user)
            print(f"  [+] Created user: {u['username']} [{u['role']}]")

        # Seed system status rows
        for dept in DEPARTMENTS:
            existing = await db.execute(
                select(SystemStatus).where(SystemStatus.department_key == dept["department_key"])
            )
            if existing.scalar_one_or_none():
                print(f"  [skip] SystemStatus '{dept['department_key']}' already exists")
                continue
            row = SystemStatus(
                department_key=dept["department_key"],
                department_name=dept["department_name"],
                status="ONLINE",
                simulated_delay_ms=0,
                total_requests=0,
                successful_requests=0,
                failed_requests=0,
            )
            db.add(row)
            print(f"  [+] Created SystemStatus: {dept['department_name']}")

        await db.commit()
        print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
