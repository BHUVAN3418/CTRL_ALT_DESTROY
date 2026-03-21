"""
Policy Data Model — RainGuard AI
Represents a worker's insurance policy (coverage tier, premium, dates).
"""

from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime


class CoverageTier(str, Enum):
    BASIC = "basic"       # Max payout ₹150
    STANDARD = "standard" # Max payout ₹300
    PLUS = "plus"         # Max payout ₹500


class PolicyStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    PENDING_PAYMENT = "pending_payment"


# Payout amounts per tier per trigger severity
PAYOUT_TABLE = {
    "heavy_rainfall": {"basic": 150, "standard": 300, "plus": 500},
    "imd_red_alert":  {"basic": 150, "standard": 300, "plus": 500},
    "aqi_hazardous":  {"basic": 100, "standard": 200, "plus": 350},
    "extreme_heat":   {"basic": 100, "standard": 200, "plus": 350},
    "platform_outage": {"basic": 100, "standard": 200, "plus": 300},
}

# Weekly premium range per tier (base; AI engine adjusts)
BASE_WEEKLY_PREMIUM = {
    CoverageTier.BASIC: 20,
    CoverageTier.STANDARD: 30,
    CoverageTier.PLUS: 40,
}


class PolicyCreate(BaseModel):
    worker_id: str
    coverage_tier: CoverageTier
    # calculated_premium returned by server based on risk score

    class Config:
        json_schema_extra = {
            "example": {
                "worker_id": "wkr_abc123",
                "coverage_tier": "standard"
            }
        }


class PolicyResponse(BaseModel):
    id: str
    worker_id: str
    coverage_tier: CoverageTier
    weekly_premium_inr: float           # Final premium after AI risk modifiers
    risk_score: int                     # Worker risk score at time of purchase
    status: PolicyStatus
    valid_from: datetime
    valid_until: datetime               # 7 days from creation (weekly)
    total_claims_paid: float = 0.0
    created_at: datetime

    class Config:
        use_enum_values = True
