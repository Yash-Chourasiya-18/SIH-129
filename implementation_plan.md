# MahaSetu — Implementation Plan

**SIH 2026 | Problem Statement #129 | Government of Maharashtra**

## Environment Confirmed
- **Python**: 3.14.6 (FastAPI not installed — will install via pip)
- **Node**: v24.18.1 / npm 11.16.0 (execution policy fixed)
- **Docker**: NOT available — will run services natively (Python + SQLite instead of PostgreSQL for portability)
- **Workspace**: `d:\Projects\SIH` — empty, ready to initialize

> [!IMPORTANT]
> **Docker is not installed.** Architecture will be adapted: PostgreSQL → **SQLite** (via SQLAlchemy, zero-config, same ORM interface). Everything else stays identical. The docker-compose file will still be generated for documentation/judges, but local dev runs natively.

---

## Architecture (Native Run)

```
Frontend (Vite+React+TS+Tailwind) :5173
        │
        ▼
MahaSetu Backend (FastAPI)        :8000
        │
        ├── /mock/citizen/{id}   ← Citizen Registry Mock
        ├── /mock/education/{id} ← Education Dept Mock
        ├── /mock/revenue/{id}   ← Revenue Dept Mock
        ├── /mock/welfare/{id}   ← Welfare Dept Mock
        │
        ├── /api/auth/*          ← JWT Auth
        ├── /api/services/scholarship/verify  ← Orchestration
        ├── /api/officer/*       ← Officer endpoints
        ├── /api/admin/*         ← Admin endpoints
        │
        ▼
SQLite DB (dev) / PostgreSQL (prod)
  - users
  - applications
  - audit_logs
  - system_status
```

---

## Project Structure

```
d:\Projects\SIH\
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py       # JWT, RBAC
│   │   │   ├── database.py       # SQLAlchemy setup
│   │   │   └── rate_limit.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── application.py
│   │   │   └── audit_log.py
│   │   ├── schemas/              # Pydantic schemas
│   │   │   ├── auth.py
│   │   │   ├── application.py
│   │   │   └── normalized.py     # Common internal model
│   │   ├── mock_systems/         # Independent mock APIs
│   │   │   ├── citizen_registry.py
│   │   │   ├── education_dept.py
│   │   │   ├── revenue_dept.py
│   │   │   └── welfare_dept.py
│   │   ├── integration/
│   │   │   ├── gateway.py        # API gateway calls
│   │   │   ├── normalizer.py     # Schema transformation
│   │   │   ├── orchestrator.py   # Workflow engine
│   │   │   └── eligibility.py    # Deterministic rules
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── mock_apis.py
│   │   │   ├── services.py       # Scholarship verify
│   │   │   ├── officer.py
│   │   │   └── admin.py
│   │   └── seed_data.py          # Demo data seeder
│   └── tests/
│       └── test_scholarship.py
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/                  # Typed API client
│   │   ├── contexts/             # Auth context
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── CitizenDashboard.tsx
│   │   │   ├── ScholarshipApply.tsx
│   │   │   ├── LiveVerification.tsx
│   │   │   ├── VerificationResult.tsx
│   │   │   ├── OfficerDashboard.tsx
│   │   │   ├── SystemHealth.tsx
│   │   │   └── AuditLogs.tsx
│   │   └── components/
│   │       ├── VerificationSteps.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── AuditTable.tsx
│   │       └── SystemCard.tsx
│   └── index.html
│
├── README.md
├── ARCHITECTURE.md
├── API_DOCUMENTATION.md
└── docker-compose.yml
```

---

## Mock Data Plan (10 citizens)

| ID | Name | Income | Marks | Prior Benefit | Expected |
|---|---|---|---|---|---|
| MH1001 | Rahul Sharma | 1,80,000 | 82% | No | ✅ ELIGIBLE |
| MH1002 | Priya Patil | 3,20,000 | 78% | No | ❌ High Income |
| MH1003 | Amit Desai | 1,50,000 | 48% | No | ❌ Low Marks |
| MH1004 | Sneha Kulkarni | 2,10,000 | 71% | Yes | ❌ Prior Benefit |
| MH1005 | Rohan Jadhav | 90,000 | 88% | No | ✅ ELIGIBLE |
| MH1006 | Meera Joshi | 1,95,000 | 65% | No | ✅ ELIGIBLE |
| MH1007 | Kiran Shinde | 2,40,000 | 55% | No | ❌ High Income + Low Marks |
| MH1008 | Pooja Wagh | 1,20,000 | 74% | No | ✅ ELIGIBLE |
| MH1009 | Suresh Naik | 1,80,000 | 60% | No | ✅ ELIGIBLE (boundary) |
| MH1010 | Ananya More | 2,00,000 | 72% | No | ❌ Slight Income |

**Special cases in mock data:**
- MH1003: Name in Education system = "Amit D." → triggers mismatch detection
- MH1010: Revenue API will be the "simulatable offline" citizen for demo

---

## Eligibility Rules (Deterministic)

```python
def is_eligible(income, marks, prior_benefit):
    return (
        income < 250_000          # Annual family income
        and marks >= 60           # Academic threshold
        and not prior_benefit     # Not already a beneficiary
    )
```

---

## Security Model

| Layer | Mechanism |
|---|---|
| Authentication | JWT (HS256, 30min access / 7day refresh) |
| Authorization | RBAC: `citizen`, `officer`, `admin` |
| Inter-service | Mock API key header `X-MahaSetu-Key` |
| Rate limiting | In-memory sliding window (10 req/min per user) |
| Input validation | Pydantic strict models |
| Audit | Every mock API call recorded in `audit_logs` |

---

## Key API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Issue JWT |
| GET | /api/auth/me | Any JWT | Current user |
| GET | /mock/citizen/{id} | Internal key | Citizen Registry |
| GET | /mock/education/{id} | Internal key | Education Dept |
| GET | /mock/revenue/{id} | Internal key | Revenue Dept |
| GET | /mock/welfare/{id} | Internal key | Welfare Dept |
| POST | /api/services/scholarship/verify | citizen/officer | Orchestrate |
| GET | /api/applications/{id} | citizen/officer | Get result |
| GET | /api/officer/applications | officer/admin | List all |
| GET | /api/admin/audit-logs | officer/admin | Audit trail |
| GET | /api/admin/system-status | admin | Health |
| PATCH | /api/admin/system-status/{dept} | admin | Toggle online/offline/slow |
| POST | /api/services/scholarship/retry/{app_id} | officer/admin | Retry failed |

---

## Execution Sequence

1. **[x] Inspect workspace** — done
2. **[x] Create backend** — FastAPI + SQLAlchemy + SQLite
3. **[x] Seed demo data** — 10 citizens across 4 independent systems  
4. **[x] Create frontend** — Vite + React + TypeScript + Tailwind
5. **[x] Install backend deps** — completed
6. **[x] Install frontend deps** — completed
7. **[x] Run backend** — backend tested & functional
8. **[x] Run frontend** — frontend verified (`npm run build` succeeds)
9. **[x] End-to-end test** — multi-citizen scholarship verification verified
10. **[x] Test failure simulation** — Revenue API outage simulation implemented
11. **[x] Test retry** — restore + retry workflow functional
12. **[x] Generate docs** — README, ARCHITECTURE, API docs complete

---

## Demo Credentials

| Role | Username | Password |
|---|---|---|
| Citizen | rahul.sharma | citizen123 |
| Citizen | priya.patil | citizen123 |
| Officer | officer.pune | officer123 |
| Admin | admin | admin123 |
