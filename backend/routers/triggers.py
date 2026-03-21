"""
Triggers Router — RainGuard AI
Exposes endpoints to check current trigger conditions across cities.
In Phase 2 this is backed by a background polling worker.
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

# Mock trigger status (Phase 1 — replaced by live API polling in Phase 2)
MOCK_TRIGGER_STATUS = {
    "bangalore": {
        "heavy_rainfall": {"active": True, "value": 42.5, "threshold": 35.0, "unit": "mm/3hr"},
        "imd_red_alert": {"active": True, "value": 1, "threshold": 1, "unit": "alert_issued"},
        "aqi_hazardous": {"active": False, "value": 145, "threshold": 300, "unit": "AQI"},
        "extreme_heat": {"active": False, "value": 34.2, "threshold": 43.0, "unit": "°C"},
        "platform_outage": {"active": False, "value": 0, "threshold": 0, "unit": "simulated"},
    },
    "mumbai": {
        "heavy_rainfall": {"active": False, "value": 18.0, "threshold": 35.0, "unit": "mm/3hr"},
        "imd_red_alert": {"active": False, "value": 0, "threshold": 1, "unit": "alert_issued"},
        "aqi_hazardous": {"active": False, "value": 210, "threshold": 300, "unit": "AQI"},
        "extreme_heat": {"active": False, "value": 38.0, "threshold": 43.0, "unit": "°C"},
        "platform_outage": {"active": False, "value": 0, "threshold": 0, "unit": "simulated"},
    }
}


@router.get("/status/{city}")
async def get_trigger_status(city: str):
    """
    Get current parametric trigger conditions for a city.
    Phase 1: Returns mock data.
    Phase 2: Live data from OpenWeatherMap + OpenAQ + IMD.
    """
    city_lower = city.lower()
    triggers = MOCK_TRIGGER_STATUS.get(city_lower, {})
    active_count = sum(1 for t in triggers.values() if t["active"])

    return {
        "city": city,
        "as_of": datetime.utcnow().isoformat(),
        "active_triggers": active_count,
        "triggers": triggers,
        "data_source": "mock (Phase 1) — live APIs in Phase 2"
    }


@router.get("/status")
async def get_all_trigger_status():
    """Get trigger status for all monitored cities."""
    return {
        city: {"active_triggers": sum(1 for t in triggers.values() if t["active"]), "triggers": triggers}
        for city, triggers in MOCK_TRIGGER_STATUS.items()
    }
