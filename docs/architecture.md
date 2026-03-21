# RainGuard AI — System Architecture

## Overview

RainGuard AI is a parametric insurance platform with five distinct layers.

## Layer 1: User Interfaces

| Interface | Users | Technology |
|-----------|-------|-----------|
| Worker App | Delivery workers (Swiggy/Zomato) | React (mobile-browser-friendly) |
| Insurer Dashboard | Insurance admin team | React (desktop-optimized) |
| Admin Portal | Internal ops team | React (Phase 2) |

## Layer 2: API Gateway

FastAPI serves as the central gateway:
- JWT-based authentication (workers + admins have different roles)
- Rate limiting (prevent API abuse)
- Request routing to microservices
- CORS configuration for React frontend

## Layer 3: Core Services

### Risk Engine
- Called at worker onboarding
- Input: pincode, city, delivery hours
- Output: risk score 0–100 → premium modifier
- Model: Random Forest (scikit-learn) trained on IMD + synthetic data

### Policy Service
- Creates weekly policies
- Calculates final premium: Base + Risk Modifier + City Modifier
- Manages policy lifecycle (active, expired, renewal)

### Claim Service
- **Claims are NEVER manually filed** — always auto-created by the trigger service
- Receives trigger events → creates claim → calls Fraud Detector
- Initiates Razorpay payout if claim approved

### Fraud Detector (3-Layer)
```
Layer 1: GPS Cross-Reference
  → Worker's last GPS location vs rainfall event centroid
  → >2km apart = flag

Layer 2: Isolation Forest ML
  → Features: claim_frequency, payout_ratio, hour_of_claim, days_enrolled
  → Score >0.7 = review | >0.9 = auto-reject

Layer 3: Platform Activity Check
  → Mock Swiggy/Zomato API
  → Completed orders during disruption window = claim denied
```

## Layer 4: External APIs

| API | Purpose | Auth |
|-----|---------|------|
| OpenWeatherMap | Rainfall (mm/3h) + Temperature | Free API key |
| OpenAQ | AQI data for Indian cities | No key required |
| Mock IMD JSON | Red/Orange alert status | Internal mock |
| Razorpay | UPI payout (test mode) | Sandbox credentials |

## Layer 5: Data Layer

```
PostgreSQL (primary database)
├── workers       — profile, risk score, UPI ID
├── policies      — coverage tier, premium, dates
├── claims        — trigger type, amount, fraud score, status
└── trigger_log   — raw API responses, timestamps

Redis (ephemeral state)
├── cooldown:{worker_id}:{trigger_type}  TTL = cooldown window
└── trigger_state:{city}                 15-min polling cache

Model Store (filesystem)
├── risk_scoring_model.pkl
└── fraud_isolation_forest.pkl
```

## Data Flow — Happy Path (Trigger → Payout)

```
1. Trigger polling service runs every 15 minutes
2. Calls OpenWeatherMap for city-level + pincode rainfall data
3. If threshold crossed:
   a. Query DB: workers with active policies in affected pincode
   b. For each worker:
      - Check Redis: is cooldown active? Skip if yes.
      - Create claim record in DB (status: PROCESSING)
      - Layer 1 Fraud Check: GPS distance
      - Layer 2 Fraud Check: Isolation Forest score
      - Layer 3 Fraud Check: Platform activity
   c. If all checks pass (action = APPROVE):
      - Call Razorpay API → initiate UPI payout
      - Update claim status → PAID
      - Set Redis cooldown TTL
      - Send push notification to worker
```

## Cooldown Windows (Anti-duplicate)

| Trigger | Cooldown |
|---------|---------|
| Heavy Rainfall | 24 hours |
| IMD Red Alert | 24 hours |
| AQI Hazardous | 12 hours |
| Extreme Heat | 12 hours |
| Platform Outage | 6 hours |

Implemented via Redis TTL keys: `cooldown:{worker_id}:{trigger_type}`
