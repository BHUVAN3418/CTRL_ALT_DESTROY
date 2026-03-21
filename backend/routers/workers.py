"""
Workers Router — RainGuard AI
Handles worker registration, profile retrieval, and risk score refresh.
"""

from fastapi import APIRouter, HTTPException, status
from models.worker import WorkerCreate, WorkerUpdate, WorkerResponse
from datetime import datetime
import uuid

router = APIRouter()

# ─── In-memory store (Phase 1 placeholder — replace with PostgreSQL in Phase 2) ─
_workers: dict[str, dict] = {}


@router.post("/register", response_model=WorkerResponse, status_code=201)
async def register_worker(worker: WorkerCreate):
    """
    Register a new food delivery worker.
    Triggers the Risk Engine to compute an initial risk score.
    """
    worker_id = f"wkr_{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow()

    # TODO (Phase 2): Call Risk Engine service for real risk score
    mock_risk_score = _mock_risk_score(worker.city, worker.pincode, worker.weekly_delivery_hours)

    record = {
        "id": worker_id,
        **worker.model_dump(),
        "risk_score": mock_risk_score,
        "status": "pending_verification",
        "created_at": now,
        "updated_at": now,
    }
    _workers[worker_id] = record
    return WorkerResponse(**record)


@router.get("/{worker_id}", response_model=WorkerResponse)
async def get_worker(worker_id: str):
    """Retrieve a worker's profile and current risk score."""
    if worker_id not in _workers:
        raise HTTPException(status_code=404, detail="Worker not found")
    return WorkerResponse(**_workers[worker_id])


@router.patch("/{worker_id}", response_model=WorkerResponse)
async def update_worker(worker_id: str, updates: WorkerUpdate):
    """Update worker profile fields."""
    if worker_id not in _workers:
        raise HTTPException(status_code=404, detail="Worker not found")
    record = _workers[worker_id]
    for field, value in updates.model_dump(exclude_unset=True).items():
        record[field] = value
    record["updated_at"] = datetime.utcnow()
    return WorkerResponse(**record)


# ─── Helpers ────────────────────────────────────────────────────────────────

def _mock_risk_score(city: str, pincode: str, hours: int) -> int:
    """
    Placeholder risk score until ML model is trained (Phase 2).
    Based on city risk tier + delivery hours.
    """
    city_base = {"bangalore": 70, "mumbai": 75, "chennai": 55, "hyderabad": 50}
    base = city_base.get(city.lower(), 60)
    hour_bonus = min(int(hours / 10), 15)  # Max +15 for high hours
    return min(base + hour_bonus, 100)
