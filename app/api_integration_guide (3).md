# GetVaxxed — Frontend API Integration Guide

This guide details all API endpoints, request headers, authentication flows, and typed payloads for frontend developers building both the **Facility Admin Portal** and the **Super Admin Portal**.

---

## 1. Global Setup & Authentication Architecture

### Base URL & Headers
- **Base URL**: `http://localhost:8000/api/v1` (or your deployed backend URL)
- **Headers required for all authenticated endpoints**:
  ```http
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```

### Auth Flow Overview
1. **Login (`POST /auth/login`)**: Returns `access_token`, `role`, `user_id`, and `facility_id`.
2. **Save Token**: Store `access_token` in local storage or secure HTTP-only cookies.
3. **Session Hydration (`GET /auth/me`)**: Call on initial load to get current user details, greeting name, role, facility name, and facility type.
4. **Token Refresh (`POST /auth/refresh`)**: Call periodically or on 401 response to renew expired tokens.

---

## 2. Facility Admin Portal Endpoints

The Facility Admin Portal is single-facility scoped. All queries automatically filter by the `facility_id` contained in the JWT token.

### A. Auth & Session

#### `POST /auth/login`
- **Request**:
  ```json
  { "email": "admin@clinic.gh", "password": "password123" }
  ```
- **Response** (200 OK):
  ```json
  {
    "access_token": "eyJhbGci...",
    "token_type": "bearer",
    "role": "facility_admin",
    "user_id": "usr-123",
    "facility_id": "fac-101"
  }
  ```

#### `GET /auth/me`
- **Response** (200 OK):
  ```json
  {
    "id": "usr-123",
    "name": "Dr. Robert",
    "role": "facility_admin",
    "facility_name": "Lafy AI · Family Health Clinic",
    "facility_type": "Clinic",
    "facility_id": "fac-101"
  }
  ```

#### `POST /auth/logout`
- **Response** (200 OK): `{"message": "Logged out successfully"}`

#### `POST /auth/refresh`
- **Response** (200 OK): Returns new `TokenResponse`.

---

### B. Dashboard

#### `GET /dashboard/summary?range=all|7d|30d`
- **Purpose**: Top metric cards.
- **Response**:
  ```json
  {
    "date": "Tuesday, 18 August 2026",
    "enrolled_patients": { "value": 128, "delta_label": "+12 this month" },
    "completion_rate": { "value": 94.2, "unit": "%", "sub_label": "Target: 90%" },
    "open_aefi": { "value": 2, "sub_label": "1 Critical, 1 Moderate" },
    "health_workers": { "value": 6, "sub_label": "6 active" }
  }
  ```

#### `GET /dashboard/recent-activity?search=&limit=10&page=1`
- **Response**:
  ```json
  {
    "items": [
      {
        "user_name": "Nurse Sarah",
        "user_role": "Health worker",
        "timestamp": "2026-08-18T10:15:00Z",
        "action": "Administered Penta 3 to Kweku Mensah",
        "audit_log_id": "aud-101"
      }
    ]
  }
  ```

#### `GET /dashboard/coverage-summary`
- **Response**:
  ```json
  {
    "target_pct": 90.0,
    "antigens": [
      { "name": "BCG", "coverage_pct": 98.5 },
      { "name": "Penta 1", "coverage_pct": 95.0 }
    ]
  }
  ```

#### `GET /dashboard/aefi-latest?limit=3`
- **Response**:
  ```json
  {
    "items": [
      {
        "id": "alert-1",
        "patient_name": "Kofi Mensah",
        "health_worker": "Sarah Appiah",
        "severity": "Critical",
        "status": "Pending",
        "note": "High fever (>39C) & rash after Penta 3",
        "vaccine": "Penta 3",
        "session_code": "S-104",
        "batch": "B89012",
        "reported": "2h ago"
      }
    ]
  }
  ```

#### `GET /dashboard/message-delivery-summary`
- **Response**:
  ```json
  {
    "period": "Last 30 days",
    "delivered_pct": 96.5,
    "read_pct": 88.2,
    "fail_pct": 3.3
  }
  ```

#### `GET /billing/plan` & `POST /billing/upgrade`
- **GET Response**: `{ "plan_name": "Growth", "trial_status": "Active (14 days remaining)", "can_upgrade": true }`
- **POST Response**: `{ "message": "Upgrade request submitted", "status": "pending_confirmation" }`

---

### C. Patients Management

#### `GET /patients?status=all|upcoming|confirmed|overdue|se_alert|completed&search=&page=1`
- **Response**:
  ```json
  {
    "patients": [
      {
        "id": "pat-101",
        "first_name": "Kweku",
        "last_name": "Mensah",
        "age_display": "6 months",
        "sex": "male",
        "masked_phone": "+233 ••• ••45",
        "caretaker_name": "Ama Mensah",
        "status": "upcoming",
        "done_doses": 4,
        "total_doses": 6,
        "has_open_alert": false
      }
    ],
    "total": 128,
    "page": 1,
    "pages": 3,
    "limit": 50
  }
  ```

#### `GET /patients/counts`
- **Response**: `{ "all": 128, "upcoming": 45, "confirmed": 30, "overdue": 12, "se_alerts": 2, "completed": 39 }`

#### `POST /patients` (Enroll Patient)
- **Request**:
  ```json
  {
    "baby_name": "Kofi Mensah",
    "sex": "male",
    "date_of_birth": "2026-02-10",
    "caretaker_name": "Ama Mensah",
    "caretaker_phone": "+233241234567"
  }
  ```

#### `GET /patients/:id/vaccines` & `PATCH /patients/:id/vaccines/:vaccineId`
- **PATCH Request**: `{ "status": "given", "date_given": "2026-08-18T10:00:00Z" }` (status options: `given`, `missed`, `rescheduled`)

---

### D. Health Workers & Credentials Generation

#### `GET /health-workers?search=`
- **Response**:
  ```json
  {
    "total": 3,
    "items": [
      {
        "id": "hw-1",
        "name": "Sarah Appiah",
        "role": "Health worker",
        "patients": 42,
        "avg_aefi_response": "1.2h",
        "status": "Active"
      }
    ]
  }
  ```

#### `POST /health-workers` (Onboard Nurse / Health Worker)
- **Purpose**: Creates a health worker account and generates login credentials for the nurse to log in to the **Nurses Portal**.
- **Request**:
  ```json
  {
    "name": "Ama Darko",
    "role": "Health worker",
    "phone_or_email": "ama.darko@clinic.gh",
    "password": "OptionalTemporaryPassword123!"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": "usr-550",
    "name": "Ama Darko",
    "role": "Health worker",
    "patients": 0,
    "avg_aefi_response": "N/A",
    "status": "Active",
    "generated_credentials": {
      "email": "ama.darko@clinic.gh",
      "temporary_password": "NursePass2026!",
      "login_portal": "Nurses Portal"
    }
  }
  ```

#### `POST /health-workers/:id/suspend` & `POST /health-workers/:id/reactivate`
- **Response**: `{ "id": "usr-550", "status": "Suspended" }` / `{ "id": "usr-550", "status": "Active" }`

---

### E. AEFI Alerts

#### `GET /aefi-alerts/summary`
- **Response**:
  ```json
  {
    "critical_open": { "value": 1, "sub_label": "Requires immediate follow up" },
    "moderate_open": { "value": 1, "most_reported": "Fever >38.5°C" },
    "mild_open": { "value": 3, "most_reported": "Rash/Swelling" }
  }
  ```

#### `GET /aefi-alerts/counts` & `POST /aefi-alerts/:id/resolve`
- **POST `/aefi-alerts/:id/resolve` Request**: `{ "resolution_note": "Patient treated with paracetamol, fever subsided." }`

---

### F. Audit Log, Message Log, Notifications & Settings

- `GET /audit-log?search=&user=&date_from=&date_to=&page=1`
- `GET /message-log?search=&channel=&status=&page=1`
- `POST /message-log/:id/resend`
- `GET /message-templates`
- `GET /notifications` & `POST /notifications/:id/read`
- `GET /settings` & `PATCH /settings`: Update `facility_name`, `location`, `emergency_phone`, `target_coverage_pct`.
- `GET /help`: Returns FAQs and support contacts.

---

## 3. Super Admin Portal Endpoints

The Super Admin Portal is platform-wide and provides oversight across all regions, implementors, facilities, users, and billing accounts.

### A. Overview & Dashboard

#### `GET /admin/overview/summary`
- **Response**:
  ```json
  {
    "total_users": {
      "total_count": 1229,
      "active_count": 1067,
      "breakdown": { "implementors": 148, "health_workers": 1042, "facilities": 39 }
    },
    "facilities": { "total_count": 39, "regions_count": 6 },
    "children_enrolled": { "total_count": 21750, "male_count": 11093, "female_count": 10657 },
    "national_coverage": { "current_pct": 74.0, "target_pct": 90.0 },
    "open_se_alerts": { "total_open": 15, "scope": "cross_implementor" }
  }
  ```

#### `GET /admin/overview/trends?period=6m&granularity=monthly`
- **Response**: Array of `{ "month": "2026-07", "coverage_pct": 74.0, "adherence_pct": 80.0 }`.

---

### B. Implementors Management

#### `GET /admin/implementors?search=&region=&status=&page=1&limit=10`
- **Response**: Paginated list of implementor organizations, assigned lead info, facility counts, enrolled children, coverage %, and open AEFI count.

#### `GET /admin/implementors/:id`
- **Response**: Detailed metrics and subscription information for a single implementor.

#### `PATCH /admin/implementors/:id/status`
- **Request**: `{ "status": "active" }` (or `suspended`, `onboarding`).

---

### C. Facilities Management

#### `GET /admin/facilities?search=&region=&plan=&status=&page=1&limit=10`
- **Response**: List of all facilities nationwide with subscription tier, seats licensed, and completion rate.

#### `POST /admin/facilities` (Create / Onboard Facility)
- **Request**:
  ```json
  {
    "name": "Ridge Regional Hospital Clinic",
    "type": "Hospital",
    "region": "Greater Accra",
    "district": "Accra Metropolitan",
    "plan": "National",
    "seats": 60
  }
  ```

---

### D. Programs & Users Oversight

#### `GET /admin/programs` & `POST /admin/programs`
- **POST Request**:
  ```json
  {
    "name": "2026 Measles Rubella Campaign",
    "description": "Nationwide catch-up campaign",
    "type": "measles_campaign",
    "start_date": "2026-09-01",
    "end_date": "2026-11-30",
    "region_id": "reg-101"
  }
  ```

#### `GET /admin/users?search=&role=&status=`
- **Response**: List of all platform users across all roles (Super Admin, Implementor Lead, Facility Admin, Health Worker) with last active timestamps.

#### `PATCH /admin/users/:id/status`
- **Request**: `{ "status": "active" }` or `{ "status": "suspended" }`.

---

### E. Global Billing & Revenue Management

#### `GET /admin/billing`
- **Response**:
  ```json
  {
    "metrics": {
      "mrr_usd": 5590,
      "total_accounts": 6,
      "active_accounts": 3,
      "licensed_seats": 184,
      "past_due_accounts": 1
    },
    "plans": [
      { "plan": "Starter", "price_per_month": 250, "seats_included": 10, "description": "Single facility" },
      { "plan": "Growth", "price_per_month": 780, "seats_included": 30, "description": "Multi-facility" },
      { "plan": "National", "price_per_month": 2400, "seats_included": 60, "description": "Region-wide rollout" }
    ],
    "accounts": [
      {
        "id": "acc-1001",
        "account_name": "LafyAI Field Ops",
        "subscriber_type": "implementor",
        "plan": "National",
        "facilities_count": 12,
        "seats": 60,
        "amount": 2400,
        "billing_cycle": "Monthly",
        "next_invoice": "2026-09-01",
        "status": "Active"
      }
    ]
  }
  ```

---

## 4. Frontend Integration Tips & Best Practices

1. **Handling 401 Unauthorized**: Configure your HTTP client (Axios/Fetch) interceptor to attempt a refresh call (`POST /auth/refresh`) or redirect to `/login`.
2. **Nurse Credential Handover**: When calling `POST /health-workers`, display a success modal containing the `generated_credentials` (Email & Temporary Password) so the facility admin can copy or print them for the nurse.
3. **Tab Counts**: Fetch tab count endpoints (`/patients/counts`, `/aefi-alerts/counts`) concurrently with list requests to render accurate badge counts on UI tabs.
