from fastapi import APIRouter
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

class Alert(BaseModel):
    id: str
    city_id: str
    city_name: str
    level: str
    message: str
    dust_level: float
    timestamp: str
    expires_at: Optional[str] = None

# In-memory alerts storage (replace with database in production)
active_alerts: List[Alert] = []

@router.get("/")
async def get_all_alerts():
    """Get all active alerts"""
    return {
        "count": len(active_alerts),
        "alerts": active_alerts
    }

@router.get("/active")
async def get_active_alerts():
    """Get currently active alerts"""
    now = datetime.utcnow()
    active = [a for a in active_alerts if not a.expires_at or datetime.fromisoformat(a.expires_at) > now]
    return {
        "count": len(active),
        "alerts": active
    }

@router.get("/city/{city_id}")
async def get_city_alerts(city_id: str):
    """Get alerts for a specific city"""
    city_alerts = [a for a in active_alerts if a.city_id == city_id]
    return {
        "city_id": city_id,
        "count": len(city_alerts),
        "alerts": city_alerts
    }

def create_alert(city_id: str, city_name: str, dust_level: float) -> Optional[Alert]:
    """Create alert based on dust level"""
    if dust_level < 50:
        return None
    
    if dust_level >= 200:
        level = "EXTREME"
        message = f"🚨 EXTREME sandstorm conditions in {city_name}! Stay indoors!"
    elif dust_level >= 100:
        level = "SEVERE"
        message = f"⚠️ SEVERE dust storm warning for {city_name}. Limit outdoor activities."
    elif dust_level >= 50:
        level = "HIGH"
        message = f"⚡ HIGH dust levels in {city_name}. Sensitive groups should take precautions."
    else:
        return None
    
    alert = Alert(
        id=f"{city_id}_{datetime.utcnow().timestamp()}",
        city_id=city_id,
        city_name=city_name,
        level=level,
        message=message,
        dust_level=dust_level,
        timestamp=datetime.utcnow().isoformat()
    )
    
    active_alerts.append(alert)
    return alert
