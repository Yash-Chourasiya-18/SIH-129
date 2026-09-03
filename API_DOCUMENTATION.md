# MahaSetu — API Specification & Integration Guide

> **SIH 2026 | Problem Statement #129 | Government of Maharashtra**  
> Base URL: `http://localhost:8000`  
> OpenAPI Interactive Specs: `http://localhost:8000/docs`

---

## 1. Authentication Endpoints

### 1.1 User Login
* **POST** `/api/auth/login`
* **Auth**: Public
* **Request Body**:
```json
{
  "username": "rahul.sharma",
  "password": "citizen123"
}
```
* **Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer",
  "role": "citizen",
  "user": {
    "id": 1,
    "username": "rahul.sharma",
    "full_name": "Rahul Sharma",
    "role": "citizen",
    "citizen_id": "MH1001"
  }
}
```

### 1.2 Current User Info
* **GET** `/api/auth/me`
* **Auth**: Bearer Token
* **Response (200 OK)**:
```json
{
  "id": 1,
  "username": "rahul.sharma",
  "full_name": "Rahul Sharma",
  "role": "citizen",
  "citizen_id": "MH1001"
}
```

---

## 2. Core Service & Verification Endpoints

### 2.1 Trigger Scholarship Eligibility Verification
* **POST** `/api/services/scholarship/verify`
* **Auth**: Bearer Token (`citizen`, `officer`, `admin`)
* **Request Body**:
```json
{
  "citizen_id": "MH1001"
}
```
* **Response (200 OK)**:
```json
{
  "application_id": 1,
  "citizen_id": "MH1001",
  "status": "COMPLETED",
  "eligibility_result": "ELIGIBLE",
  "department_statuses": {
    "citizen_registry": "SUCCESS",
    "education_dept": "SUCCESS",
    "revenue_dept": "SUCCESS",
    "welfare_dept": "SUCCESS"
  },
  "normalized_data": {
    "citizen_id": "MH1001",
    "full_name": "Rahul Sharma",
    "district": "Pune",
    "student_id": "EDU-MH1001",
    "college_name": "COEP Technological University",
    "marks_percentage": 82.5,
    "annual_income": 180000.0,
    "income_certificate_no": "REV-2025-1001",
    "already_received_benefit": false
  },
  "eligibility": {
    "is_eligible": true,
    "reasons": ["All eligibility requirements satisfied."]
  },
  "name_mismatch_warning": null
}
```

### 2.2 Retry Pending Verification
* **POST** `/api/services/scholarship/retry/{app_id}`
* **Auth**: Bearer Token (`officer`, `admin`)
* **Response (200 OK)**: Re-executes gateway fetch for incomplete departments and updates application state.

### 2.3 Get Application Details
* **GET** `/api/services/scholarship/{app_id}`
* **Auth**: Bearer Token

---

## 3. Mock Department APIs (Legacy Interoperability Layer)

*All Mock APIs require header:* `X-MahaSetu-Key: mahasetu_internal_secret_key_2026`

| Department | Path | Sample Raw Response Schema |
|---|---|---|
| **Citizen Registry** | `GET /mock/citizen/{citizen_id}` | `{"citizen_id": "MH1001", "full_name": "Rahul Sharma", "district_name": "Pune", "dob": "2002-05-14"}` |
| **Education Dept** | `GET /mock/education/{citizen_id}` | `{"student_id": "EDU-MH1001", "institution_name": "COEP Technological University", "percentage": 82.5}` |
| **Revenue Dept** | `GET /mock/revenue/{citizen_id}` | `{"id": "MH1001", "income_yearly": 180000.0, "certificate_no": "REV-2025-1001"}` |
| **Welfare Dept** | `GET /mock/welfare/{citizen_id}` | `{"beneficiary_id": "MH1001", "already_received": false}` |

---

## 4. Administrative & Operational Endpoints

### 4.1 System Status List
* **GET** `/api/admin/system-status`
* **Auth**: Bearer Token (`officer`, `admin`)

### 4.2 Toggle Department Health State (Outage Simulation)
* **PATCH** `/api/admin/system-status/{department_code}`
* **Auth**: Bearer Token (`admin`)
* **Request Body**:
```json
{
  "status": "OFFLINE"
}
```
*(Valid statuses: `ONLINE`, `OFFLINE`, `SLOW`)*

### 4.3 Audit Logs
* **GET** `/api/admin/audit-logs?page=1&per_page=20`
* **Auth**: Bearer Token (`officer`, `admin`)

---

## 5. Standard Error Responses

```json
{
  "detail": "Department revenue_dept is currently unreachable"
}
```
- `400 Bad Request`: Invalid parameters or validation failure.
- `401 Unauthorized`: Invalid credentials or expired token.
- `403 Forbidden`: Insufficient RBAC permission.
- `404 Not Found`: Citizen record or application not found.
- `429 Too Many Requests`: Rate limit exceeded (20 requests/minute).
