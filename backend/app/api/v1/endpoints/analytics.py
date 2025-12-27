from fastapi import APIRouter, HTTPException
from datetime import datetime
import numpy as np

from app.core.database import (
    get_historical_readings, 
    get_model_accuracy_stats,
    get_active_alerts
)
from app.config import settings

router = APIRouter()

@router.get("/overview")
async def get_analytics_overview():
    """Get overall analytics dashboard data"""
    all_data = []
    for city in settings.UAE_CITIES:
        history = get_historical_readings(city['id'], hours=24)
        if history:
            all_data.extend(history)

    if not all_data:
        return {
            "total_readings": 0,
            "avg_dust": 0,
            "max_dust": 0,
            "alerts_today": 0
        }

    dust_values = [d.get('dust', 0) for d in all_data if d.get('dust')]

    return {
        "total_readings": len(all_data),
        "avg_dust_24h": round(sum(dust_values) / len(dust_values), 2) if dust_values else 0,
        "max_dust_24h": round(max(dust_values), 2) if dust_values else 0,
        "min_dust_24h": round(min(dust_values), 2) if dust_values else 0,
        "active_alerts": len(get_active_alerts()),
        "model_accuracy": get_model_accuracy_stats(),
        "cities_monitored": len(settings.UAE_CITIES),
        "last_updated": datetime.utcnow().isoformat()
    }

@router.get("/history/{city_id}")
async def get_city_analytics(city_id: str, hours: int = 168):
    """Get detailed historical analytics for a city"""
    city = next((c for c in settings.UAE_CITIES if c['id'] == city_id), None)
    if not city:
        raise HTTPException(status_code=404, detail=f"City '{city_id}' not found")

    history = get_historical_readings(city_id, hours=hours)

    if not history:
        return {
            "city_id": city_id,
            "city_name": city['name'],
            "period_hours": hours,
            "data_points": 0,
            "message": "No historical data available yet"
        }

    dust_values = [d.get('dust', 0) for d in history if d.get('dust')]

    # Calculate hourly averages
    hourly_data = {}
    for reading in history:
        try:
            ts = datetime.fromisoformat(reading['timestamp'].replace('Z', '+00:00'))
            hour_key = ts.strftime('%Y-%m-%d %H:00')
            if hour_key not in hourly_data:
                hourly_data[hour_key] = []
            if reading.get('dust'):
                hourly_data[hour_key].append(reading['dust'])
        except Exception:
            pass

    hourly_averages = [
        {'time': k, 'avg_dust': round(sum(v)/len(v), 2)}
        for k, v in sorted(hourly_data.items())
        if v
    ]

    return {
        "city_id": city_id,
        "city_name": city['name'],
        "period_hours": hours,
        "data_points": len(history),
        "statistics": {
            "avg_dust": round(sum(dust_values) / len(dust_values), 2) if dust_values else 0,
            "max_dust": round(max(dust_values), 2) if dust_values else 0,
            "min_dust": round(min(dust_values), 2) if dust_values else 0,
            "std_dev": round(float(np.std(dust_values)), 2) if len(dust_values) > 1 else 0
        },
        "hourly_averages": hourly_averages[-168:],
        "risk_distribution": {
            "low": sum(1 for d in dust_values if d < 20),
            "moderate": sum(1 for d in dust_values if 20 <= d < 50),
            "high": sum(1 for d in dust_values if 50 <= d < 100),
            "severe": sum(1 for d in dust_values if 100 <= d < 200),
            "extreme": sum(1 for d in dust_values if d >= 200)
        }
    }

@router.get("/export/{city_id}")
async def export_city_data(city_id: str, format: str = "json", hours: int = 168):
    """Export historical data for a city"""
    city = next((c for c in settings.UAE_CITIES if c['id'] == city_id), None)
    if not city:
        raise HTTPException(status_code=404, detail=f"City '{city_id}' not found")

    history = get_historical_readings(city_id, hours=hours)

    if format == "json":
        return {
            "city": city,
            "exported_at": datetime.utcnow().isoformat(),
            "period_hours": hours,
            "data": history
        }
    elif format == "csv":
        if not history:
            return {"csv": "timestamp,dust,pm10,pm2_5,temperature,humidity,wind_speed,risk_level\n"}
        
        csv_lines = ["timestamp,dust,pm10,pm2_5,temperature,humidity,wind_speed,risk_level"]
        for row in history:
            csv_lines.append(
                f"{row.get('timestamp','')},{row.get('dust','')},{row.get('pm10','')},"
                f"{row.get('pm2_5','')},{row.get('temperature','')},{row.get('humidity','')},"
                f"{row.get('wind_speed','')},{row.get('risk_level','')}"
            )
        return {"csv": "\n".join(csv_lines)}
    else:
        raise HTTPException(status_code=400, detail="Format must be 'json' or 'csv'")
