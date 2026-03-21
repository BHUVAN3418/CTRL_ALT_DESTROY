"""
Policies Router — RainGuard AI
Handles policy creation with premium calculation.
"""

from fastapi import APIRouter, HTTPException
from models.policy import PolicyCreate, PolicyResponse, CoverageTier, PolicyStatus, BASE_WEEKLY_PREMIUM
from datetime import datetime, timedelta
import uuid

router = APIRouter()

_policies: dict[str, dict] = {}
_workers_ref: dict[str, dict] = {}  # Shared with workers router in Phase 2 (via DB)

# City risk modifiers (₹)
CITY_MODIFIER = {"bangalore": 8, "mumbai": 8, "chennai": 0, "hyderabad": 0}


@router.post("/create", response_model=PolicyResponse, status_code=201)
async def create_policy(policy: PolicyCreate):
    """
    Create a new weekly policy for a worker.
    Premium is calculated using risk score + city modifier.
    """
    # In Phase 2: fetch worker from DB
    # For Phase 1: use a mock worker record
    risk_score = 65  # placeholder
    city = "bangalore"  # placeholder

    premium = _calculate_premium(policy.coverage_tier, risk_score, city)

    policy_id = f"pol_{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow()
    record = {
        "id": policy_id,
        "worker_id": policy.worker_id,
        "coverage_tier": policy.coverage_tier,
        "weekly_premium_inr": premium,
        "risk_score": risk_score,
        "status": PolicyStatus.ACTIVE,
        "valid_from": now,
        "valid_until": now + timedelta(days=7),
        "total_claims_paid": 0.0,
        "created_at": now,
    }
    _policies[policy_id] = record
    return PolicyResponse(**record)


@router.get("/{policy_id}", response_model=PolicyResponse)
async def get_policy(policy_id: str):
    if policy_id not in _policies:
        raise HTTPException(status_code=404, detail="Policy not found")
    return PolicyResponse(**_policies[policy_id])


@router.get("/worker/{worker_id}", response_model=list[PolicyResponse])
async def get_worker_policies(worker_id: str):
    """Return all policies for a given worker."""
    return [PolicyResponse(**p) for p in _policies.values() if p["worker_id"] == worker_id]


def _calculate_premium(tier: CoverageTier, risk_score: int, city: str) -> float:
    """
    Premium = Base + risk score modifier + city modifier
    Risk score 0-100 → ₹0 to ₹15 modifier (linear)
    """
    base = BASE_WEEKLY_PREMIUM[tier]
    risk_modifier = round((risk_score / 100) * 15, 2)
    city_mod = CITY_MODIFIER.get(city.lower(), 0)
    return round(base + risk_modifier + city_mod, 2)
