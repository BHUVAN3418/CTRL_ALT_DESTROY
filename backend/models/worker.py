"""
Worker Data Model — RainGuard AI
Represents a food delivery worker (Swiggy / Zomato) registered on the platform.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum
from datetime import datetime


class DeliveryPlatform(str, Enum):
    SWIGGY = "swiggy"
    ZOMATO = "zomato"
    BOTH = "both"


class City(str, Enum):
    BANGALORE = "bangalore"
    MUMBAI = "mumbai"
    CHENNAI = "chennai"
    HYDERABAD = "hyderabad"


class WorkerStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


# ─── Request / Input Schemas ────────────────────────────────────────────────

class WorkerCreate(BaseModel):
    full_name: str
    phone_number: str                       # Primary identifier (UPI linked)
    email: Optional[EmailStr] = None
    city: City
    pincode: str                            # 6-digit Indian pincode
    delivery_platform: DeliveryPlatform
    weekly_delivery_hours: int              # Used for risk scoring
    upi_id: str                             # For automatic payouts

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "Raju Kumar",
                "phone_number": "9876543210",
                "email": "raju@example.com",
                "city": "bangalore",
                "pincode": "560001",
                "delivery_platform": "swiggy",
                "weekly_delivery_hours": 40,
                "upi_id": "raju@upi"
            }
        }


class WorkerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    pincode: Optional[str] = None
    weekly_delivery_hours: Optional[int] = None
    upi_id: Optional[str] = None


# ─── Response Schemas ────────────────────────────────────────────────────────

class WorkerResponse(BaseModel):
    id: str
    full_name: str
    phone_number: str
    city: City
    pincode: str
    delivery_platform: DeliveryPlatform
    weekly_delivery_hours: int
    risk_score: Optional[int] = None        # 0–100, set by Risk Engine
    status: WorkerStatus = WorkerStatus.PENDING_VERIFICATION
    created_at: datetime
    updated_at: datetime

    class Config:
        use_enum_values = True
