# 🌧️ RainGuard AI — Parametric Income Insurance for Food Delivery Workers

> **"When rain stops work, RainGuard pays automatically."**

[![Phase](https://img.shields.io/badge/Phase-1%20Seed-orange)](https://github.com)
[![Stack](https://img.shields.io/badge/Stack-FastAPI%20%2B%20React%20%2B%20scikit--learn-blue)](https://github.com)
[![Status](https://img.shields.io/badge/Status-Active%20Development-green)](https://github.com)

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [Our Solution](#2-our-solution)
3. [Weekly Premium Model](#3-weekly-premium-model)
4. [5 Parametric Triggers](#4-5-parametric-triggers)
5. [AI / ML Architecture](#5-ai--ml-architecture)
6. [Fraud Detection Design](#6-fraud-detection-design)
7. [Tech Stack](#7-tech-stack)
8. [Web vs Mobile Decision](#8-web-vs-mobile-decision)
9. [System Architecture](#9-system-architecture)
10. [6-Week Development Roadmap](#10-6-week-development-roadmap)
11. [Repository Structure](#11-repository-structure)
12. [Getting Started](#12-getting-started)

---

## 1. The Problem

### The Human Story

**Raju, 27**, is a Swiggy delivery rider in Bangalore. He earns an average of **₹600/day** — ₹18,000/month when conditions are good. But during monsoon months (June–September), he loses **30% of his monthly income**. On an IMD Red Alert rain day, he earns **₹0**.

Yet his expenses don't pause:
- Fuel: ₹80/day
- Phone data plan: ₹29/day
- EMI for his scooter: ₹3,200/month
- Rent: ₹6,500/month

> *On a red-alert rain day, Raju earns nothing — but his EMIs are still due.*

### Three Dimensions of the Problem

| Dimension | Detail |
|-----------|--------|
| **Suddenness** | A rain alert gives zero time to save up — income loss is instant and complete |
| **Product Gap** | No insurance product covers weather-linked income loss for gig workers |
| **Accessibility** | Traditional insurance is too complex — weekly gig workers cannot afford monthly premiums with long claim processes |

### Market Scale

- **5 million+** food delivery workers in India (Swiggy + Zomato combined)
- **₹2,400 Cr** average annual income lost to weather disruptions across this workforce
- **0 insurance products** currently address this specific risk

---

## 2. Our Solution

**RainGuard AI** is a **parametric insurance platform** designed exclusively for food delivery workers (Swiggy / Zomato) in Tier-1 Indian cities.

### What is Parametric Insurance?

Unlike traditional insurance that requires workers to *prove* loss with paperwork, receipts, and waiting periods — **parametric insurance pays automatically when a pre-agreed trigger event occurs**.

No paperwork. No waiting. No claims form. No rejection risk.

### How It Works — Raju's Journey

```
1. Raju downloads the RainGuard app
2. Creates a profile (name, phone, pincode, delivery platform)
3. Picks a weekly coverage plan (Basic / Standard / Plus)
4. Pays ₹25–50 weekly premium via UPI

— [Heavy rain falls in Bangalore] —

5. Our Weather API detects 38mm rainfall in 3 hours in Raju's pincode
6. Trigger fires automatically
7. Risk & fraud checks run in seconds
8. Razorpay sends ₹300 (Standard) to Raju's UPI
9. Raju gets a push notification: "₹300 payout received. Stay safe."
```

### Target Persona & Cities

Exclusively targeting **food delivery workers** (not cab drivers, not retail delivery) in:
- 🏙️ Bangalore
- 🏙️ Mumbai
- 🏙️ Chennai
- 🏙️ Hyderabad

> **Why food delivery specifically?** Hot food cannot be delayed — delivery riders in this category face the most acute income impact from weather, making our parametric triggers razor-sharp and defensible.

---

## 3. Weekly Premium Model

Gig workers think and earn **week-to-week**. Our premium is structured weekly to match their cash flow.

### Formula

```
Final Premium = Base Premium + City Risk Modifier + Pincode Variance Modifier + Hours Modifier
```

| Component | Range | Description |
|-----------|-------|-------------|
| **Base Premium** | ₹25/week | Starting point for all workers |
| City Monsoon Risk | -₹5 to +₹8 | Low / Medium / High monsoon risk zone |
| Historical Rainfall Variance | +₹0 to +₹7 | Based on 5-year IMD pincode data |
| Delivery Hours/Week | +₹0 to +₹5 | More hours = more at-risk income |
| **Final Weekly Premium** | **₹20 – ₹50** | After all modifiers applied |

### Coverage Tiers

| Tier | Weekly Premium (approx.) | Max Payout per Event |
|------|--------------------------|----------------------|
| **Basic** | ₹20–30 | ₹150 |
| **Standard** | ₹30–40 | ₹300 |
| **Plus** | ₹40–50 | ₹500 |

### Premium Justification

- Average gig worker spends ₹80–120/day on fuel and operational costs
- At ₹25–50/week, the premium is **4–8% of one average earning day**
- A single payout of ₹300 (Standard) covers 1.5 lost work days — **net positive on any single trigger event**

---

## 4. Five Parametric Triggers

Each trigger is connected to a real public API (or mock) and fires automatically when the threshold is crossed.

| # | Trigger | API / Source | Threshold | Payout (Basic / Standard / Plus) | Cooldown |
|---|---------|-------------|-----------|----------------------------------|----------|
| 1 | **Heavy Rainfall** | OpenWeatherMap (free) | >35mm in 3 hours in worker pincode | ₹150 / ₹300 / ₹500 | 24 hours |
| 2 | **IMD Red Alert** | IMD scrape or mock JSON | Red/Orange Alert issued for worker's district | ₹150 / ₹300 / ₹500 | 24 hours |
| 3 | **AQI Hazardous** | OpenAQ API (free, no key) | AQI > 300 (CPCB Hazardous category) | ₹100 / ₹200 / ₹350 | 12 hours |
| 4 | **Extreme Heat** | OpenWeatherMap (free) | Temperature > 43°C | ₹100 / ₹200 / ₹350 | 12 hours |
| 5 | **Platform Outage** | Simulated Swiggy/Zomato API | 0 orders assigned for 2+ hours | ₹100 / ₹200 / ₹300 | 6 hours |

### Trigger Architecture Notes

- **Triggers 1, 3, 4** use real free-tier APIs — production-ready
- **Trigger 2** uses a mock JSON scraped from IMD during live usage; safe placeholder for Phase 1
- **Trigger 5** is fully simulated via our internal mock — accepted per Guidewire DEVTrails rules
- **Anti-duplicate logic**: One payout per trigger type per worker per cooldown window (managed via Redis TTL keys)

---

## 5. AI / ML Architecture

### Model 1 — Risk Scoring Engine (Premium Calculation)

Produces a **0–100 risk score** per worker/location that feeds the premium formula.

| Item | Detail |
|------|--------|
| **Algorithm** | Random Forest / XGBoost (scikit-learn) |
| **Input Features** | Pincode flood history (IMD 5yr), rainfall variance, claim density by zone, delivery platform type, worker hours/week |
| **Training Data** | IMD historical rainfall CSVs (public domain) + 5,000 synthetic worker profiles |
| **Output** | Risk score 0–100 → mapped to premium modifier (₹-5 to +₹20) |
| **Integration** | Called at onboarding, refreshed every Monday |
| **Inference Time** | <200ms per worker |

**Risk Score → Premium Modifier Mapping:**

```python
def score_to_modifier(score: int) -> int:
    if score < 20:   return -5    # Low risk city, dry season
    elif score < 40: return 0     # Base rate
    elif score < 60: return 5     # Moderate monsoon zone
    elif score < 80: return 10    # High-risk pincode
    else:            return 15    # Extreme risk (coastal + monsoon)
```

**Key Features Used:**

```
- avg_rainfall_5yr_mm         : Historical average rainfall (mm/year)
- rainfall_variance           : Std. deviation of monthly rainfall
- flood_events_5yr            : Number of flood events in pincode
- claim_density_zone          : Claims per 100 workers in zone (prior data)
- delivery_hours_per_week     : Proxy for income at stake
- city_risk_tier              : Bangalore=High, Mumbai=High, Chennai=Medium, Hyderabad=Medium
```

---

## 6. Fraud Detection Design

Three-layer system ensures RainGuard cannot be abused, protecting the insurance pool.

### Layer 1 — GPS Cross-Reference (Automatic, Real-Time)

| Check | Logic |
|-------|-------|
| **What it does** | At claim time, fetches worker's last recorded GPS location |
| **Flag condition** | Worker's last location is >2km from the rainfall event centroid |
| **Action** | Claim flagged for manual review; payout paused 24 hours |
| **Why it works** | A rider who wasn't in the rain zone cannot claim for it |

### Layer 2 — ML Anomaly Detection (Isolation Forest)

| Item | Detail |
|------|--------|
| **Algorithm** | Isolation Forest (scikit-learn, unsupervised) |
| **Input Features** | claim_frequency_30d, avg_payout_amount, hour_of_claim, days_since_enrollment, claim_to_premium_ratio |
| **Output** | Anomaly score 0.0–1.0 |
| **Thresholds** | Score >0.7 → Review queue \| Score >0.9 → Auto-reject |
| **Training** | Bootstrapped on synthetic clean + injected fraudulent profiles |

```python
# Pseudocode: Isolation Forest fraud check
def check_fraud(claim: Claim, worker: Worker) -> FraudResult:
    features = extract_features(claim, worker)  
    score = isolation_forest.decision_function([features])
    normalized = normalize(score)  # 0.0 = normal, 1.0 = anomalous
    
    if normalized > 0.9:
        return FraudResult(action="AUTO_REJECT", score=normalized)
    elif normalized > 0.7:
        return FraudResult(action="MANUAL_REVIEW", score=normalized)
    else:
        return FraudResult(action="APPROVE", score=normalized)
```

### Layer 3 — Platform Activity Check (Mock API)

| Check | Logic |
|-------|-------|
| **What it does** | Queries mock Swiggy/Zomato API for worker's delivery activity |
| **Flag condition** | Worker shows completed deliveries during the claimed disruption window |
| **Action** | If active orders found → Claim auto-denied |
| **Why it works** | A worker who was delivering during a "rain outage" wasn't actually impacted |

---

## 7. Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Backend** | Python — FastAPI | Fast to build, native ML library support, clean REST APIs, async support |
| **Frontend** | React (Web App) | Works on mobile browser; insurer dashboard needs desktop; mobile app is Phase 3 |
| **Database** | PostgreSQL + Redis | PostgreSQL for relational data (workers, policies, claims); Redis for real-time trigger state & cooldown TTLs |
| **AI / ML** | scikit-learn + pandas | Sufficient for Phase 1–2 models; explainable to non-technical judges |
| **Deployment** | Render.com (free tier) | Live public URL; judges can test; no localhost submissions |
| **Weather API** | OpenWeatherMap | Free tier: 1,000 calls/day; real data for all 4 target cities |
| **AQI API** | OpenAQ | Free, no API key needed, covers all major Indian cities via REST |
| **Payments** | Razorpay Test Mode | Simulated UPI payout; industry-standard for India; sandbox fully available |

---

## 8. Web vs Mobile Decision

| Factor | Web App (Our Choice ✅) | Native Mobile App |
|--------|------------------------|-------------------|
| **Development Speed** | 1–2 weeks for MVP | 3–4 weeks minimum |
| **Phase 1 Scope** | Wireframes + React screens | Not feasible in 2 weeks |
| **Insurer Dashboard** | Full desktop experience | Awkward on mobile |
| **Worker Access** | Works in mobile browser | Requires Play Store |
| **Phase 3 Plan** | Convert to React Native / PWA | Planned for Phase 3 |

**Decision:** Build a responsive **React web app** that is **mobile-browser-friendly** for workers, and **desktop-optimized** for the insurer dashboard. A dedicated Android app is on the Phase 3 roadmap.

---

## 9. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                               │
│  Worker App (React)  |  Insurer Dashboard  |  Admin Portal      │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────────┐
│                    FastAPI GATEWAY                              │
│           Auth (JWT)  |  Rate Limiting  |  Routing             │
└────┬──────────────┬────────────┬──────────────┬────────────────┘
     │              │            │              │
┌────▼───┐  ┌──────▼──┐  ┌─────▼────┐  ┌──────▼──────┐
│ Risk   │  │ Policy  │  │  Claim   │  │   Fraud     │
│ Engine │  │ Service │  │ Service  │  │  Detector   │
└────┬───┘  └──────┬──┘  └─────┬────┘  └──────┬──────┘
     │              │            │              │
┌────▼──────────────▼────────────▼──────────────▼──────┐
│                  EXTERNAL APIs                        │
│  OpenWeatherMap | OpenAQ | Mock IMD | Razorpay (test)│
└───────────────────────────────────────────────────────┘
     │
┌────▼──────────────────────────────────────────────────┐
│                   DATA LAYER                          │
│    PostgreSQL (workers, policies, claims)              │
│    Redis (trigger state, cooldown TTLs)                │
│    Model Store (scikit-learn pickle files)             │
└───────────────────────────────────────────────────────┘
```

All four core services are independent microservices communicating via REST, enabling parallel development across team members.

---

## 10. 6-Week Development Roadmap

| Phase | Weeks | Theme | What We Build |
|-------|-------|-------|---------------|
| **🌱 Seed** | 1–2 | Ideate & Foundation | README, repo, wireframes, FastAPI setup, data model design, 2-min video |
| **📈 Scale** | 3–4 | Automation & Protection | Full registration flow, policy management, premium calculation engine, 5 parametric triggers, basic claims flow, ML risk model integration |
| **🚀 Soar** | 5–6 | Perfect for Workers | Advanced fraud detection (3 layers), Razorpay simulated payouts, worker + insurer dashboards, final pitch deck, 5-min demo video |

### Week-by-Week Breakdown

#### Seed Phase (Weeks 1–2) — Current
- [x] README.md with full documentation
- [x] GitHub repository + folder structure
- [ ] React wireframes (Login, Dashboard, Payout screens)
- [ ] FastAPI /health endpoint + data models
- [ ] 2-minute video

#### Scale Phase (Weeks 3–4)
- [ ] Worker registration + JWT auth
- [ ] Policy creation + premium calculation API
- [ ] Weather trigger polling service (OpenWeatherMap + OpenAQ)
- [ ] Claims auto-filing when threshold crossed
- [ ] Risk scoring ML model trained + integrated
- [ ] Basic worker dashboard showing policy + claim history

#### Soar Phase (Weeks 5–6)
- [ ] All 3 fraud detection layers operational
- [ ] Razorpay test mode payout flow
- [ ] Insurer dashboard (claim overrides, policy management)
- [ ] Admin portal (trigger logs, fraud review queue)
- [ ] End-to-end demo with simulated trigger event
- [ ] Final pitch deck + 5-minute demo video

---

## 11. Repository Structure

```
rainguard-ai/
├── README.md                   # This document
├── backend/                    # FastAPI backend
│   ├── main.py                 # App entry point + gateway
│   ├── requirements.txt        # Python dependencies  
│   ├── routers/                # API route handlers
│   │   ├── workers.py          # Worker registration, profile
│   │   ├── policies.py         # Policy creation, management
│   │   ├── claims.py           # Claim filing, status
│   │   └── triggers.py         # Parametric trigger endpoints
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── worker.py
│   │   ├── policy.py
│   │   └── claim.py
│   └── services/               # Business logic
│       ├── risk_engine.py      # Premium calculation
│       ├── fraud_detector.py   # Fraud detection layers
│       └── trigger_service.py  # Weather API polling
├── frontend/                   # React web application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── PayoutNotification.jsx
│   │   └── components/
│   │       ├── TriggerStatus.jsx
│   │       └── PremiumCard.jsx
│   └── package.json
├── ml/                         # ML models and training scripts
│   ├── risk_scoring/
│   │   ├── train_model.py      # Model training script
│   │   └── predict.py          # Inference API wrapper
│   ├── fraud_detection/
│   │   ├── isolation_forest.py # Anomaly detection model
│   │   └── pseudocode.md       # Algorithm documentation
│   └── data/                   # Training data (synthetic + IMD)
└── docs/
    ├── architecture.md          # Detailed system design
    └── api-spec.md              # REST API specification
```

---

## 12. Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm start
# App available at http://localhost:3000
```

### Health Check

```bash
curl http://localhost:8000/health
# {"status": "healthy", "service": "RainGuard AI API", "version": "0.1.0"}
```

---

## Team

Built for **Guidewire DEVTrails 2026** — Parametric Insurance Challenge.

> *Build fast. Spend smart. Don't go broke.*

---

*RainGuard AI — Protecting India's gig economy, one raindrop at a time. 🌧️*
