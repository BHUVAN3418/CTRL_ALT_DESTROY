# 🌧️ RainGuard AI
### AI-Powered Parametric Income Insurance for Food Delivery Workers

> **"When rain stops work, RainGuard pays automatically."**

![Guidewire DEVTrails 2026](https://img.shields.io/badge/Guidewire-DEVTrails%202026-1D4E8A?style=for-the-badge)
![Phase](https://img.shields.io/badge/Phase-1%20%7C%20Seed-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-In%20Progress-orange?style=for-the-badge)

---

## 📋 Table of Contents
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Persona & User Scenarios](#-persona--user-scenarios)
- [Application Workflow](#-application-workflow)
- [Weekly Premium Model](#-weekly-premium-model)
- [Parametric Triggers](#-parametric-triggers)
- [AI/ML Integration Plan](#-aiml-integration-plan)
- [Fraud Detection Design](#-fraud-detection-design)
- [Platform Choice](#-platform-choice--web)
- [Tech Stack](#-tech-stack)
- [Development Plan](#-development-plan)

---

## 🚨 The Problem

India's food delivery workers (Swiggy, Zomato) are the backbone of urban commerce — but they are completely exposed to weather-linked income loss.

- A heavy rain day = **₹0 earnings** for a delivery rider
- Gig workers lose **20–30% of monthly income** during monsoon months
- **No insurance product exists** that protects this income loss
- Traditional insurance is too complex, too slow, and not structured for weekly earners

When disruptions occur, workers bear the full financial loss with **zero safety net**.

---

## 💡 Our Solution

**RainGuard AI** is a parametric insurance platform exclusively for food delivery workers on Swiggy and Zomato in Tier-1 Indian cities (Bangalore, Mumbai, Chennai, Hyderabad).

### What makes it parametric?
Unlike traditional insurance where you file a claim and wait weeks, **parametric insurance pays automatically** the moment a pre-agreed trigger event is detected — no paperwork, no waiting, no rejection risk.

```
Rain detected above threshold in worker's zone
        ↓
System triggers automatically
        ↓
UPI payout sent to worker's account
        ↓
Worker receives money — same day
```

### What we cover (and what we don't)
| ✅ Covered | ❌ Not Covered |
|---|---|
| Income lost due to heavy rainfall | Health or medical expenses |
| Income lost due to extreme heat | Vehicle repairs |
| Income lost due to hazardous AQI | Accidents |
| Income lost due to IMD Red Alerts | Life insurance |

---

## 👤 Persona & User Scenarios

### Primary Persona — Raju, 27, Bangalore

> Raju delivers for Swiggy in Bangalore's Koramangala–Indiranagar zone. He earns ₹600/day on a good day — about ₹4,000/week. During monsoon months (June–September), he loses 25–30% of his income because orders dry up and riding in heavy rain is dangerous. He has no savings buffer, pays ₹3,200/month rent, and has a bike EMI of ₹1,800/month.

**Scenario 1 — Heavy Rain Event**
It's a Tuesday evening. IMD issues a Red Alert for Bangalore. Rainfall crosses 40mm in 3 hours in Koramangala. RainGuard detects this via the Weather API, validates Raju's GPS is in the affected zone, and automatically sends ₹300 to his UPI account. Raju receives a push notification. He didn't file anything.

**Scenario 2 — Extreme Heat Event**
It's May in Chennai. Temperature crosses 44°C. Raju's friend Suresh, a Zomato rider in Chennai, is registered on RainGuard. The heat trigger fires. Suresh gets ₹200 sent to his account automatically. He works a shorter morning shift instead of risking the afternoon heat.

**Scenario 3 — Attempted Fraud**
A worker tries to claim by spoofing their GPS location to appear inside a rain zone while actually working elsewhere. RainGuard's fraud detection layer cross-references their actual location history and delivery activity during the claimed window. The claim is automatically flagged and held for review.

---

## 🔄 Application Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    WORKER JOURNEY                        │
└─────────────────────────────────────────────────────────┘

[1. ONBOARDING]
Worker downloads app → Registers with phone number
→ Enters delivery platform (Swiggy/Zomato)
→ Enters primary delivery zone / pincode
→ AI Risk Engine scores their location (Low/Medium/High risk)
→ Weekly premium is calculated and shown

[2. POLICY SELECTION]
Worker picks coverage tier:
  Basic   → ₹20–30/week → ₹150 max per event
  Standard → ₹30–40/week → ₹300 max per event
  Plus    → ₹40–50/week → ₹500 max per event
→ Worker pays via UPI / auto-debit weekly

[3. ACTIVE COVERAGE]
RainGuard monitors weather APIs 24/7 for worker's zone
→ Trigger detected → Fraud check runs automatically
→ If valid → Payout sent to worker's UPI
→ Worker receives push notification + SMS

[4. DASHBOARD]
Worker can see:
  - Current week's coverage status
  - Past payouts received
  - Upcoming weather risk forecast for their zone
  - Total income protected this month
```

---

## 💰 Weekly Premium Model

Gig workers think and earn week-to-week. Our premium is structured weekly to match this cycle.

### Formula

```
Final Weekly Premium = Base Premium + Risk Modifiers

Base Premium = ₹25/week

Modifiers (applied by AI Risk Engine):
  City monsoon risk zone:
    Low risk city    → -₹5
    Medium risk city →  ₹0
    High risk city   → +₹8

  Pincode flood history (5yr IMD data):
    Low variance     →  ₹0
    Medium variance  → +₹3
    High variance    → +₹7

  Worker delivery hours/week (income at stake):
    < 30 hrs/week    →  ₹0
    30–50 hrs/week   → +₹3
    > 50 hrs/week    → +₹5

Final Range: ₹20/week (low risk) to ₹50/week (high risk)
```

### Payout Thresholds (IMD-aligned)

| Trigger Event | Threshold | Payout (Basic) | Payout (Standard) | Payout (Plus) |
|---|---|---|---|---|
| Heavy Rainfall | >35mm in 3 hours | ₹150 | ₹300 | ₹500 |
| Very Heavy Rainfall | >65mm in 3 hours | ₹150 | ₹300 | ₹500 |
| IMD Red Alert (City) | Issued for worker's district | ₹150 | ₹300 | ₹500 |
| Extreme Heat | Temperature > 43°C | ₹100 | ₹200 | ₹350 |
| AQI Hazardous | AQI > 300 (CPCB data) | ₹100 | ₹200 | ₹350 |

> **Cooldown rule:** One payout per trigger event per worker per 24-hour window. Prevents duplicate claims for the same event.

### Business Model (Loss Ratio)
RainGuard profits from workers whose zones do not trigger in a given week. Not every pincode experiences the same weather. A city-wide Red Alert is the risk scenario — managed through zone-level pricing and the 24hr cooldown window.

---

## ⚡ Parametric Triggers

We build exactly 5 automated triggers using public and mock APIs:

| # | Trigger Name | API / Data Source | Threshold | Cooldown |
|---|---|---|---|---|
| 1 | Heavy Rainfall | OpenWeatherMap (free tier) | >35mm in 3hr in worker's pincode | 24 hours |
| 2 | IMD Red/Orange Alert | IMD alert feed / mock JSON | Alert issued for worker's district | 24 hours |
| 3 | AQI Hazardous | OpenAQ API (free, no key needed) | AQI > 300 | 12 hours |
| 4 | Extreme Heat | OpenWeatherMap (free tier) | Temperature > 43°C | 12 hours |
| 5 | Platform Outage | Simulated Swiggy/Zomato API | 0 orders assigned for 2+ hours | 6 hours |

**Trigger Engine Logic:**
```python
# Pseudocode — trigger evaluation loop
def evaluate_triggers(worker):
    zone = worker.pincode
    
    rainfall = weather_api.get_rainfall(zone, last_3_hours)
    if rainfall > 35:
        if not cooldown_active(worker, "rainfall", hours=24):
            initiate_payout(worker, trigger="rainfall")
    
    aqi = openaq_api.get_aqi(zone)
    if aqi > 300:
        if not cooldown_active(worker, "aqi", hours=12):
            initiate_payout(worker, trigger="aqi")
    
    # ... repeat for heat, IMD alert, platform outage
```

---

## 🤖 AI/ML Integration Plan

### Model 1 — Risk Scoring Engine (Premium Calculation)

**Purpose:** Produce a 0–100 risk score per worker/location that feeds the premium formula.

| Item | Detail |
|---|---|
| Algorithm | Random Forest / XGBoost (scikit-learn) |
| Input Features | Pincode flood history (IMD 5yr data), rainfall variance, historical claim density by zone, delivery platform type |
| Training Data | IMD historical rainfall CSVs (public) + synthetic worker profiles |
| Output | Risk score 0–100 → mapped to premium modifier |
| When It Runs | At worker onboarding + refreshed weekly |

### Model 2 — Fraud Detection (Anomaly Detection)

**Purpose:** Detect fraudulent claims before payout is processed.

| Item | Detail |
|---|---|
| Algorithm | Isolation Forest (unsupervised anomaly detection) |
| Input Features | GPS location at claim time, time delta between trigger and claim, claim frequency per worker, delivery activity during disruption window |
| Output | Anomaly score 0–1. Score > 0.7 = flag for review. Score > 0.9 = auto-reject |
| When It Runs | Every time a payout is about to be triggered |

### Dynamic Pricing Intelligence
The risk model also enables **hyper-local pricing** — a worker in a pincode historically safe from waterlogging pays ₹2–5 less per week than a worker in a flood-prone pincode, even within the same city. This is the core AI innovation beyond rule-based pricing.

---

## 🔍 Fraud Detection Design

Fraud detection runs as a **3-layer system** before every payout:

### Layer 1 — GPS Cross-Reference (Automatic)
- At claim time, system checks worker's last known GPS location
- If worker's location is **more than 2km from the rainfall event centroid** → flagged
- Logic: If it's raining heavily in Koramangala, a worker showing GPS in Whitefield shouldn't be claiming

### Layer 2 — ML Anomaly Detection (Pattern-Based)
- Isolation Forest model scores the claim against historical patterns
- Red flags: claiming in a week with 0 city alerts, 3+ claims in 2 weeks, claim timing always within minutes of trigger
- Score > 0.7 → held for manual review
- Score > 0.9 → auto-rejected, insurer notified

### Layer 3 — Platform Activity Validation (API Check)
- Cross-reference with mock Swiggy/Zomato delivery data
- If platform shows worker **completed deliveries during the claimed disruption window** → claim denied
- Example: Rainfall trigger fires at 6pm. Worker claims. But platform API shows they completed 5 orders between 5:30–7pm → claim is invalid.

---

## 🖥️ Platform Choice — Web

We chose a **Web Application** over a native mobile app for Phase 1 for the following reasons:

| Factor | Reasoning |
|---|---|
| Insurer dashboard | Admin and insurer users need desktop access for analytics — not practical on mobile |
| Development speed | React web app is faster to build and demo for Phase 1 |
| Worker access | Workers can access via mobile browser — no app store approval needed |
| Native mobile app | Planned for Phase 3 (Soar) as a dedicated React Native app |

---

## 🛠️ Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| Backend | Python — FastAPI | Fast to build, native ML library support, clean REST APIs |
| Frontend | React.js | Works on mobile browser; insurer dashboard needs desktop |
| Database | PostgreSQL | Relational data for workers, policies, claims |
| Cache / State | Redis | Real-time trigger state and cooldown tracking |
| AI / ML | scikit-learn + pandas | Sufficient for Phase 1–2 models; easy to demo |
| Deployment | Render.com (free tier) | Live public URL for judges to test |
| Weather API | OpenWeatherMap | Free tier: 1,000 calls/day; covers all target cities |
| AQI API | OpenAQ | Free, no API key needed, covers Indian cities |
| Payments | Razorpay Test Mode | Simulated UPI payout; industry-standard sandbox |

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER LAYER                            │
│   Worker App (React)  |  Insurer Dashboard  |  Admin Portal  │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      API GATEWAY                             │
│              Auth · Rate Limiting · Routing                  │
└──────┬──────────────┬──────────────┬───────────┬────────────┘
       │              │              │           │
  ┌────▼────┐   ┌─────▼─────┐ ┌─────▼────┐ ┌───▼────────┐
  │  Risk   │   │  Policy   │ │  Claim   │ │  Fraud     │
  │ Engine  │   │  Service  │ │ Service  │ │ Detector   │
  └────┬────┘   └─────┬─────┘ └─────┬────┘ └───┬────────┘
       │              │              │           │
┌──────▼──────────────▼──────────────▼───────────▼──────────┐
│                    EXTERNAL APIs                            │
│  OpenWeatherMap  |  OpenAQ  |  Platform API  |  Razorpay   │
└──────────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│                     DATA LAYER                           │
│   PostgreSQL (workers, policies, claims)                 │
│   Redis (trigger state, cooldowns)                       │
│   ML Model Store (scikit-learn pickle files)             │
└──────────────────────────────────────────────────────────┘
```

---

## 📅 Development Plan

### Phase 1 — Seed (Weeks 1–2) | March 4–20
**Theme: Ideate & Know Your Delivery Worker**
- [x] Problem definition and persona research
- [x] Premium model design with IMD-aligned thresholds
- [x] 5 parametric trigger definitions
- [x] AI/ML architecture plan
- [x] Fraud detection 3-layer design
- [x] Tech stack finalized
- [ ] GitHub repository structure
- [ ] Basic React wireframes (Login, Dashboard, Payout screen)
- [ ] FastAPI project setup with folder structure
- [ ] 2-minute strategy video

### Phase 2 — Scale (Weeks 3–4) | March 21–April 4
**Theme: Protect Your Worker**
- [ ] Worker registration and onboarding flow
- [ ] Insurance policy management (create, view, renew)
- [ ] Dynamic premium calculation engine (AI risk model integrated)
- [ ] 5 parametric trigger engine (live API connections)
- [ ] Claims management system
- [ ] Basic fraud detection (Layer 1 + Layer 2)
- [ ] 2-minute demo video

### Phase 3 — Soar (Weeks 5–6) | April 5–17
**Theme: Perfect for Your Worker**
- [ ] Advanced fraud detection (all 3 layers)
- [ ] Razorpay test mode payout integration
- [ ] Worker dashboard (earnings protected, active coverage)
- [ ] Insurer dashboard (loss ratios, predictive analytics)
- [ ] Final pitch deck (PDF)
- [ ] 5-minute demo video with simulated disruption walkthrough

---


---

## 📄 License
This project is built for Guidewire DEVTrails 2026. All rights reserved.

---

<p align="center">
  Built with ❤️ for India's gig workers · Guidewire DEVTrails 2026
</p>
