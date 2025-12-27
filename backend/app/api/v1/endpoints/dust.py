from fastapi import APIRouter, HTTPException
from datetime import datetime
import aiohttp

from app.services.cache_service import CacheService
from app.services.data_collector import DataCollector
from app.config import settings

router = APIRouter()
cache = CacheService()

@router.get("/current")
async def get_current_dust():
    """Get current dust levels for all UAE cities"""
    data = await cache.get_all_current()
    
    if not data:
        collector = DataCollector()
        data = await collector.collect_all_cities()

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "count": len(data),
        "cities": sorted(data, key=lambda x: x.get('city_name', ''))
    }

@router.get("/current/{city_id}")
async def get_city_dust(city_id: str):
    """Get current dust level for a specific city"""
    city = next((c for c in settings.UAE_CITIES if c['id'] == city_id), None)
    if not city:
        raise HTTPException(status_code=404, detail=f"City '{city_id}' not found")

    data = await cache.get_current(city_id)
    if not data:
        collector = DataCollector()
        async with aiohttp.ClientSession() as session:
            data = await collector.collect_city(session, city)

    return data

@router.get("/history/{city_id}")
async def get_city_history(city_id: str, hours: int = 24):
    """Get historical dust data for a city"""
    city = next((c for c in settings.UAE_CITIES if c['id'] == city_id), None)
    if not city:
        raise HTTPException(status_code=404, detail=f"City '{city_id}' not found")

    history = await cache.get_history(city_id, hours)

    return {
        "city_id": city_id,
        "city_name": city['name'],
        "hours": hours,
        "count": len(history),
        "data": history
    }
