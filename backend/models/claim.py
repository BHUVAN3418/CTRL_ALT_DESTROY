"""
Claim Data Model — RainGuard AI
Represents an auto-filed parametric claim triggered by a weather event.
"""

from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime


class TriggerType(str, Enum):
    HEAVY_RAINFALL = "heavy_rainfall"
    IMD_RED_ALERT = "imd_red_alert"
    AQI_HAZARDOUS = "aqi_hazardous"
    EXTREME_HEAT = "extreme_heat"
    PLATFORM_OUTAGE = "platform_outage"


class ClaimStatus(str, Enum):
    AUTO_APPROVED = "auto_approved"
    MANUAL_REVIEW = "manual_review"
    AUTO_REJECTED = "auto_rejected"
    PAID = "paid"
    DENIED = "denied"


class FraudFlag(str, Enum):
    NONE = "none"
    GPS_MISMATCH = "gps_mismatch"          # Layer 1: >2km from event
    ANOMALY_SCORE = "anomaly_score"         # Layer 2: Isolation Forest
    PLATFORM_ACTIVE = "platform_active"    # Layer 3: Active orders found


class ClaimResponse(BaseModel):
    """
    Claims are ALWAYS auto-created by the system when a trigger fires.
    Workers never manually file a claim.
    """
    id: str
    policy_id: str
    worker_id: str
    trigger_type: TriggerType
    trigger_value: float                   # mm of rain / temp °C / AQI value
    trigger_threshold: float               # The threshold that was crossed
    payout_amount_inr: float               # Based on coverage tier
    status: ClaimStatus
    fraud_flag: Optional[FraudFlag] = None
    fraud_score: Optional[float] = None    # 0.0–1.0 from Isolation Forest
    razorpay_payment_id: Optional[str] = None
    triggered_at: datetime                 # When threshold was crossed
    paid_at: Optional[datetime] = None
    cooldown_expires_at: datetime          # Next claim allowed after this

    class Config:
        use_enum_values = True


class TriggerEvent(BaseModel):
    """Internal model for when the trigger service fires an event."""
    trigger_type: TriggerType
    city: str
    pincode: Optional[str]
    trigger_value: float
    threshold: float
    event_time: datetime
    source_api: str                        # "openweathermap" | "openaq" | "mock_imd" | "simulated"
