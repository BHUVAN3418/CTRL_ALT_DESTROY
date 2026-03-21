"""
Claims Router — RainGuard AI
Claims are auto-created by the trigger service. This router exposes claim status.
"""

from fastapi import APIRouter, HTTPException
from models.claim import ClaimResponse
from datetime import datetime
import uuid

router = APIRouter()

_claims: dict[str, dict] = {}


@router.get("/{claim_id}", response_model=ClaimResponse)
async def get_claim(claim_id: str):
    if claim_id not in _claims:
        raise HTTPException(status_code=404, detail="Claim not found")
    return ClaimResponse(**_claims[claim_id])


@router.get("/worker/{worker_id}", response_model=list[ClaimResponse])
async def get_worker_claims(worker_id: str):
    """Return all claims for a given worker — shown on the dashboard."""
    return [ClaimResponse(**c) for c in _claims.values() if c["worker_id"] == worker_id]


@router.post("/simulate-trigger", status_code=201)
async def simulate_trigger(
    worker_id: str,
    trigger_type: str = "heavy_rainfall",
    trigger_value: float = 42.0
):
    """
    DEMO ONLY: Manually fire a trigger for testing/demo purposes.
    In production, this is called by the automated trigger polling service.
    """
    claim_id = f"clm_{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow()

    payout_map = {
        "heavy_rainfall": 300,
        "imd_red_alert": 300,
        "aqi_hazardous": 200,
        "extreme_heat": 200,
        "platform_outage": 200,
    }

    claim = {
        "id": claim_id,
        "policy_id": "pol_demo001",
        "worker_id": worker_id,
        "trigger_type": trigger_type,
        "trigger_value": trigger_value,
        "trigger_threshold": 35.0,
        "payout_amount_inr": payout_map.get(trigger_type, 300),
        "status": "auto_approved",
        "fraud_flag": "none",
        "fraud_score": 0.12,
        "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:12]}",
        "triggered_at": now,
        "paid_at": now,
        "cooldown_expires_at": now,
    }
    _claims[claim_id] = claim
    return {"message": "Trigger simulated successfully", "claim": ClaimResponse(**claim)}
