# MahaSetu

**Secure Government Digital Interoperability & Service Orchestration Platform**

> SIH 2026 | Problem Statement #129 | Government of Maharashtra

---

## ⚠️ Disclaimer

**PROTOTYPE** — Uses **synthetic data only**. Not connected to real Maharashtra government systems.
Built as a demonstration for Smart India Hackathon 2026.

---

## Problem Statement

Government digital platforms operate in silos — fragmented, incompatible systems that prevent citizens from accessing integrated services. A citizen applying for a scholarship must physically visit multiple departments, submit redundant documents, and endure weeks of delays because **no system talks to another**.

## Solution — MahaSetu

MahaSetu ("Maha Bridge") acts as a **secure interoperability layer** that:

1. Connects independent legacy government department systems through a normalized API gateway
2. Orchestrates multi-department workflows triggered by a single citizen request
3. Transforms different JSON schemas from each department into one unified internal model
4. Runs deterministic eligibility rules on the normalized data
5. Records every inter-system data access in a tamper-evident audit log
6. Handles department outages gracefully without losing citizen requests

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Citizen / Officer Browser                     │
│              React + TypeScript + Tailwind CSS                   │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTP (JWT Bearer)
┌─────────────────────────────────▼───────────────────────────────┐
│                    MahaSetu Backend (FastAPI)                    │
│  ┌──────────────┐  ┌──────────────────────┐  ┌───────────────┐ │
│  │   JWT Auth   │  │  Rate Limiter        │  │  RBAC Roles   │ │
│  │   (HS256)    │  │  (sliding window)    │  │  citizen/     │ │
│  └──────────────┘  └──────────────────────┘  │  officer/     │ │
│                                               │  admin        │ │
│  ┌──────────────────────────────────────────┐ └───────────────┘ │
│  │         Orchestration Engine             │                   │
│  │  1. Concurrent department API calls      │                   │
│  │  2. Failure isolation per department     │                   │
│  │  3. Retry queue for partial failures     │                   │
│  └──────────────────────────────────────────┘                   │
│                                                                  │
│  ┌──────────────────────────────────────────┐                   │
│  │           API Gateway Layer              │                   │
│  │  X-MahaSetu-Key internal authentication  │                   │
│  │  OFFLINE / SLOW simulation support       │                   │
│  └──────┬───────┬──────────┬───────┬────────┘                   │
│         │       │          │       │                            │
│  ┌──────▼─┐ ┌───▼──┐ ┌────▼──┐ ┌──▼────┐  ← Independent       │
│  │Citizen │ │ Edu  │ │Revenue│ │Welfare│    Mock Systems        │
│  │Registry│ │ Dept │ │ Dept  │ │ Dept  │    (different schemas) │
│  └──────┬─┘ └───┬──┘ └────┬──┘ └──┬────┘                       │
│         └───────┴──────────┴───────┘                            │
│                         │                                        │
│  ┌──────────────────────▼───────────────────┐                   │
│  │        Data Normalization Layer          │                   │
│  │   citizen_id ← id, beneficiary_id       │                   │
│  │   annual_income ← income_yearly         │                   │
│  │   college_name ← institution_name       │                   │
│  └──────────────────────┬───────────────────┘                   │
│                         │                                        │
│  ┌──────────────────────▼───────────────────┐                   │
│  │       Eligibility Engine (Rules)         │                   │
│  │   income < 250000 AND marks >= 60        │                   │
│  │   AND no prior benefit                   │                   │
│  └──────────────────────┬───────────────────┘                   │
│                         │                                        │
│  ┌──────────────────────▼───────────────────┐                   │
│  │        Audit Log + SQLite DB             │                   │
│  └──────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS (via Vite) |
| Backend | Python 3.x + FastAPI |
| Database | SQLite (dev) / PostgreSQL (prod) via SQLAlchemy 2.x async |
| Auth | JWT HS256 + RBAC (citizen, officer, admin) |
| API | REST + JSON + OpenAPI (Swagger at /docs) |
| Inter-service Auth | `X-MahaSetu-Key` header |
| Rate Limiting | In-memory sliding window (20 req/min per user) |

---

## Project Structure

```
SIH/
├── backend/
│   ├── main.py                       # FastAPI app entry point
│   ├── requirements.txt
│   ├── seed_data.py                  # Demo data seeder
│   ├── .env                          # Environment config
│   └── app/
│       ├── core/
│       │   ├── config.py             # Pydantic settings
│       │   ├── database.py           # SQLAlchemy async engine
│       │   ├── security.py           # JWT + bcrypt + RBAC
│       │   └── rate_limit.py         # Sliding window rate limiter
│       ├── models/                   # SQLAlchemy ORM models
│       │   ├── user.py
│       │   ├── application.py
│       │   ├── audit_log.py
│       │   └── system_status.py
│       ├── schemas/                  # Pydantic schemas
│       │   ├── auth.py
│       │   ├── application.py
│       │   └── normalized.py         ← Common internal data model
│       ├── mock_systems/             # 4 independent mock APIs
│       │   ├── citizen_registry.py   ← citizen_id, full_name, district_name
│       │   ├── education_dept.py     ← student_id, percentage, institution_name
│       │   ├── revenue_dept.py       ← id, income_yearly, certificate_no
│       │   └── welfare_dept.py       ← beneficiary_id, already_received
│       ├── integration/
│       │   ├── gateway.py            ← API gateway (auth, OFFLINE/SLOW simulation)
│       │   ├── normalizer.py         ← Schema transformation (the key feature)
│       │   ├── orchestrator.py       ← Full workflow engine
│       │   └── eligibility.py        ← Deterministic eligibility rules
│       └── routers/
│           ├── auth.py
│           ├── mock_apis.py          ← /mock/{dept}/{id} endpoints
│           ├── services.py           ← /api/services/scholarship/verify
│           ├── officer.py
│           └── admin.py
│
├── frontend/
│   └── src/
│       ├── api/client.ts             # Typed axios client
│       ├── contexts/AuthContext.tsx  # JWT auth state
│       └── pages/
│           ├── Login.tsx
│           ├── CitizenDashboard.tsx
│           ├── ScholarshipApply.tsx
│           ├── LiveVerification.tsx
│           ├── VerificationResult.tsx
│           ├── OfficerDashboard.tsx
│           ├── SystemHealth.tsx
│           └── AuditLogs.tsx
│
├── README.md
├── ARCHITECTURE.md
├── API_DOCUMENTATION.md
└── docker-compose.yml
```

---

## Setup Instructions

### Prerequisites

- Python 3.11+ (tested on 3.14.6)
- Node.js 18+ / npm 9+ (tested on Node 24.18.1)

### Backend Setup

```bash
cd backend

# Install dependencies
pip install fastapi uvicorn[standard] sqlalchemy aiosqlite \
  pydantic pydantic-settings python-jose[cryptography] \
  bcrypt python-multipart httpx python-dotenv

# Seed the database (creates tables + demo data)
python seed_data.py

# Start the server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173**

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | (required) | JWT signing key |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token expiry |
| `DATABASE_URL` | `sqlite+aiosqlite:///./mahasetu.db` | DB connection |
| `INTERNAL_API_KEY` | (required) | Inter-service auth key |
| `RATE_LIMIT_PER_MINUTE` | `20` | Requests per user per minute |
| `FRONTEND_URL` | `http://localhost:5173` | CORS origin |

---

## API Documentation

API docs available at: **http://localhost:8000/docs** (Swagger UI)

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login, get JWT |
| GET | `/api/auth/me` | JWT | Current user info |
| GET | `/mock/citizen/{id}` | Internal Key | Citizen Registry raw data |
| GET | `/mock/education/{id}` | Internal Key | Education Dept raw data |
| GET | `/mock/revenue/{id}` | Internal Key | Revenue Dept raw data |
| GET | `/mock/welfare/{id}` | Internal Key | Welfare Dept raw data |
| POST | `/api/services/scholarship/verify` | citizen/officer/admin | Verify eligibility |
| POST | `/api/services/scholarship/retry/{app_id}` | citizen/officer/admin | Retry failed verification |
| GET | `/api/services/scholarship/{app_id}` | JWT | Get application result |
| GET | `/api/officer/applications` | officer/admin | List all applications |
| GET | `/api/officer/stats` | officer/admin | Application statistics |
| GET | `/api/admin/audit-logs` | officer/admin | Audit trail |
| GET | `/api/admin/system-status` | officer/admin | Department health |
| PATCH | `/api/admin/system-status/{dept}` | officer/admin | Simulate outage |

---

## Demo Credentials

| Role | Username | Password | Citizen ID |
|---|---|---|---|
| Citizen | `rahul.sharma` | `citizen123` | MH1001 (ELIGIBLE) |
| Citizen | `priya.patil` | `citizen123` | MH1002 (High Income) |
| Citizen | `amit.desai` | `citizen123` | MH1003 (Low Marks + Mismatch) |
| Citizen | `sneha.kulkarni` | `citizen123` | MH1004 (Prior Benefit) |
| Citizen | `rohan.jadhav` | `citizen123` | MH1005 (ELIGIBLE) |
| Officer | `officer.pune` | `officer123` | — |
| Admin | `admin` | `admin123` | — |

---

## Demo Workflow (Step-by-Step)

### Step 1: Normal Eligibility Flow
1. Open http://localhost:5173
2. Login as `rahul.sharma` / `citizen123`
3. Click **Student Scholarship** → **Verify Eligibility**
4. Watch all 4 department APIs called in real-time
5. See schema normalization (Revenue: `id` → `citizen_id`, `income_yearly` → `annual_income`)
6. Result: **ELIGIBLE**

### Step 2: Officer View
1. Login as `officer.pune` / `officer123`
2. View all applications with department-level status dots
3. Click any application → see full verification details

### Step 3: Simulate API Failure
1. Login as `admin` / `admin123`
2. Go to **System Health**
3. Click **✗ Offline** on Revenue Department
4. Login as citizen, submit verification again
5. See: Citizen ✓ | Education ✓ | Revenue ✗ OFFLINE | Welfare ✓
6. Status: **PENDING VERIFICATION**
7. Back in System Health → click **✓ Online** to restore Revenue
8. Go to Officer Dashboard → find the pending application → click **Retry**
9. See: all 4 departments SUCCESS → **ELIGIBLE**

### Step 4: Check Audit Logs
- Go to **Audit Logs** → see every API call timestamped with purpose, user, department, response time

### Step 5: Name Mismatch Demo
- Login as `amit.desai` / `citizen123`
- Submit verification — see the AI mismatch alert:
  - Citizen Registry: "Amit Desai"
  - Education Dept: "Amit D. Desai"
  - Similarity: ~85% → **MANUAL REVIEW recommended**

---

## How Interoperability Works

Each mock department returns a **different JSON schema**. MahaSetu's normalizer maps them to a unified internal model:

| Source | Raw Field | → Internal Field |
|---|---|---|
| Citizen Registry | `citizen_id`, `full_name`, `district_name` | `citizen_id`, `full_name`, `district` |
| Education Dept | `student_id`, `institution_name`, `percentage` | `student_id`, `college_name`, `percentage` |
| Revenue Dept | `id`, `income_yearly`, `certificate_no` | `citizen_id`, `annual_income`, `income_certificate_no` |
| Welfare Dept | `beneficiary_id`, `already_received` | `citizen_id`, `already_received_benefit` |

The normalizer (see `backend/app/integration/normalizer.py`) documents every field mapping explicitly.

---

## Eligibility Rules

```python
# Deterministic — no AI for the final decision
def is_eligible(income, marks, prior_benefit):
    return (
        income < 250_000          # Annual income below ₹2.5 lakh
        and marks >= 60.0         # At least 60% marks
        and not prior_benefit     # No prior scholarship
    )
```

---

## Security Model

| Layer | Mechanism |
|---|---|
| Authentication | JWT HS256, 60-min access tokens |
| Authorization | RBAC: citizen (own data only), officer, admin |
| Inter-service | `X-MahaSetu-Key` internal API key header |
| Rate Limiting | 20 requests/min/user (sliding window) |
| Input Validation | Pydantic strict schema validation |
| Audit Trail | Every department API call logged with user, purpose, timestamp |
| Data Minimization | Citizens can only access their own citizen_id |

---

## Limitations (Prototype)

1. SQLite used instead of PostgreSQL (no Docker required to run locally)
2. Mock department systems run in the same process (would be separate microservices in production)
3. In-memory rate limiter resets on server restart
4. No email/OTP-based 2FA (would be required in production)
5. JWT secrets are in .env (use HSM/Vault in production)
6. AI mismatch uses local Levenshtein, not an enterprise NLP model

---

## Future Scope

- Real OAuth2/DigiLocker integration for identity federation
- Blockchain-based audit log for tamper-evidence
- Automated consent management aligned with DPDP Act 2023
- Kafka/Redis-based retry queue for persistent failure handling
- Multi-state portal expansion beyond Maharashtra
- Aadhaar-based biometric verification integration
- PostgreSQL with read replicas for high availability
- Kubernetes deployment with service mesh (Istio)
