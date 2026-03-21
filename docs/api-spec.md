# RainGuard AI — REST API Specification

> **Phase 1 — Seed** | Full interactive docs available at [`/docs`](http://localhost:8000/docs) (Swagger UI) once the backend is running.

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8000` |
| Production  | `https://rainguard-api.onrender.com` |

---

## Authentication

All endpoints except `/health` and `/` require a **JWT Bearer token** in the `Authorization` header.

```http
Authorization: Bearer <your_jwt_token>
```

Workers receive a token upon registration. Tokens expire after **7 days** (aligned with the weekly policy cycle).

---

## Error Responses

All errors follow a consistent shape:

```json
{
  "detail": "Human-readable error message"
}
```

| HTTP Code | Meaning |
|-----------|---------|
| `400` | Bad request / validation error |
| `401` | Missing or invalid JWT token |
| `403` | Forbidden (e.g. accessing another worker's data) |
| `404` | Resource not found |
| `429` | Rate limited |
| `500` | Internal server error |

---

## Endpoints

### 🟢 Health

#### `GET /health`
Public. Basic liveness check — required for Render.com deployment health probe.

**Response `200`:**
```json
{
  "status": "healthy",
  "service": "RainGuard AI API",
  "version": "0.1.0",
  "timestamp": "2026-03-19T14:00:00Z",
  "phase": "Seed (Phase 1)"
}
```

---

### 👷 Workers — `/api/workers`

#### `POST /api/workers/register`
Register a new food delivery worker. Triggers the AI Risk Engine to compute an initial risk score, which feeds the premium formula.

**Request body:**
```json
{
  "full_name": "Raju Kumar",
  "phone_number": "9876543210",
  "email": "raju@example.com",
  "city": "bangalore",
  "pincode": "560001",
  "delivery_platform": "swiggy",
  "weekly_delivery_hours": 40,
  "upi_id": "raju@okaxis"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `full_name` | string | ✅ | |
| `phone_number` | string | ✅ | Used as primary identifier; links to UPI |
| `email` | string | ❌ | Optional |
| `city` | enum | ✅ | `bangalore` \| `mumbai` \| `chennai` \| `hyderabad` |
| `pincode` | string | ✅ | 6-digit Indian pincode |
| `delivery_platform` | enum | ✅ | `swiggy` \| `zomato` \| `both` |
| `weekly_delivery_hours` | int | ✅ | Used in premium calculation |
| `upi_id` | string | ✅ | Auto-payout destination |

**Response `201`:**
```json
{
  "id": "wkr_a1b2c3d4",
  "full_name": "Raju Kumar",
  "phone_number": "9876543210",
  "city": "bangalore",
  "pincode": "560001",
  "delivery_platform": "swiggy",
  "weekly_delivery_hours": 40,
  "risk_score": 72,
  "status": "pending_verification",
  "created_at": "2026-03-19T14:30:00Z",
  "updated_at": "2026-03-19T14:30:00Z"
}
```

---

#### `GET /api/workers/{worker_id}`
Retrieve a worker's profile and their current AI risk score.

**Response `200`:** Same shape as registration response above.

---

#### `PATCH /api/workers/{worker_id}`
Update mutable profile fields (pincode, hours, UPI ID). Risk score is recalculated on next Monday's refresh.

**Request body (all fields optional):**
```json
{
  "pincode": "560034",
  "weekly_delivery_hours": 50,
  "upi_id": "raju.kumar@okicici"
}
```

**Response `200`:** Updated worker object.

---

### 📋 Policies — `/api/policies`

#### `POST /api/policies/create`
Create a new weekly policy for a worker. The server calculates the final premium using the worker's risk score, city modifier, and coverage tier.

**Formula:**
```
Premium = Base[tier] + (risk_score / 100 × 15) + city_modifier
```

**Request body:**
```json
{
  "worker_id": "wkr_a1b2c3d4",
  "coverage_tier": "standard"
}
```

| Tier | Base Premium | Max Payout |
|------|-------------|-----------|
| `basic` | ₹20 | ₹150 |
| `standard` | ₹30 | ₹300 |
| `plus` | ₹40 | ₹500 |

**Response `201`:**
```json
{
  "id": "pol_e5f6g7h8",
  "worker_id": "wkr_a1b2c3d4",
  "coverage_tier": "standard",
  "weekly_premium_inr": 38.50,
  "risk_score": 72,
  "status": "active",
  "valid_from": "2026-03-19T00:00:00Z",
  "valid_until": "2026-03-26T00:00:00Z",
  "total_claims_paid": 0.0,
  "created_at": "2026-03-19T14:30:00Z"
}
```

---

#### `GET /api/policies/{policy_id}`
Get a specific policy by ID.

#### `GET /api/policies/worker/{worker_id}`
List all policies (active + historical) for a worker.

---

### 💸 Claims — `/api/claims`

> **Important:** Claims are **never manually filed** by workers. They are auto-created by the trigger polling service the moment a threshold is crossed. These endpoints are read-only (plus a demo endpoint).

#### `GET /api/claims/{claim_id}`
Get a specific claim, including fraud check results and payout status.

**Response `200`:**
```json
{
  "id": "clm_i9j0k1l2",
  "policy_id": "pol_e5f6g7h8",
  "worker_id": "wkr_a1b2c3d4",
  "trigger_type": "heavy_rainfall",
  "trigger_value": 42.5,
  "trigger_threshold": 35.0,
  "payout_amount_inr": 300.0,
  "status": "paid",
  "fraud_flag": "none",
  "fraud_score": 0.12,
  "razorpay_payment_id": "pay_abc123xyz456",
  "triggered_at": "2026-03-19T09:15:00Z",
  "paid_at": "2026-03-19T09:15:03Z",
  "cooldown_expires_at": "2026-03-20T09:15:00Z"
}
```

| `status` | Meaning |
|----------|---------|
| `auto_approved` | Passed all fraud checks, payout initiated |
| `manual_review` | Fraud score 0.7–0.9, queued for human review |
| `auto_rejected` | Fraud score >0.9, claim denied automatically |
| `paid` | Razorpay payout confirmed |
| `denied` | Platform activity found during disruption (Layer 3) |

---

#### `GET /api/claims/worker/{worker_id}`
List all claims for a worker — shown on the worker dashboard's Claims tab.

---

#### `POST /api/claims/simulate-trigger` *(Phase 1 Demo Only)*
Manually fire a trigger event for a worker. Used for demos and the judge walkthrough. **Will be removed in Phase 2.**

**Query params:**
```
?worker_id=wkr_a1b2c3d4&trigger_type=heavy_rainfall&trigger_value=42.0
```

**Response `201`:**
```json
{
  "message": "Trigger simulated successfully",
  "claim": { ... }   // Full ClaimResponse object
}
```

---

### ⚡ Triggers — `/api/triggers`

#### `GET /api/triggers/status/{city}`
Real-time trigger condition status for a city. Phase 1 returns mock data; Phase 2 connects to live OpenWeatherMap + OpenAQ APIs.

**Example:** `GET /api/triggers/status/bangalore`

**Response `200`:**
```json
{
  "city": "bangalore",
  "as_of": "2026-03-19T14:00:00Z",
  "active_triggers": 2,
  "triggers": {
    "heavy_rainfall": {
      "active": true,
      "value": 42.5,
      "threshold": 35.0,
      "unit": "mm/3hr"
    },
    "imd_red_alert": {
      "active": true,
      "value": 1,
      "threshold": 1,
      "unit": "alert_issued"
    },
    "aqi_hazardous": {
      "active": false,
      "value": 145,
      "threshold": 300,
      "unit": "AQI"
    },
    "extreme_heat": {
      "active": false,
      "value": 34.2,
      "threshold": 43.0,
      "unit": "°C"
    },
    "platform_outage": {
      "active": false,
      "value": 0,
      "threshold": 0,
      "unit": "simulated"
    }
  },
  "data_source": "mock (Phase 1) — live APIs in Phase 2"
}
```

#### `GET /api/triggers/status`
Same as above but returns status for **all 4 monitored cities** (Bangalore, Mumbai, Chennai, Hyderabad) in one response.

---

## Payout Trigger Reference

| Trigger | API Source | Threshold | Cooldown |
|---------|-----------|-----------|---------|
| `heavy_rainfall` | OpenWeatherMap | >35mm / 3hr | 24h |
| `imd_red_alert` | Mock IMD JSON | Alert issued | 24h |
| `aqi_hazardous` | OpenAQ | AQI > 300 | 12h |
| `extreme_heat` | OpenWeatherMap | Temp > 43°C | 12h |
| `platform_outage` | Simulated | 0 orders / 2hr | 6h |

Cooldowns are enforced via **Redis TTL keys** — one key per `{worker_id}:{trigger_type}`.

---

## Interactive Docs

Start the backend and open:

- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
