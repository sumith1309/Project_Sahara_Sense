from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/")
async def get_all_cities():
    """Get all UAE cities configuration"""
    return {
        "count": len(settings.UAE_CITIES),
        "cities": settings.UAE_CITIES
    }

@router.get("/{city_id}")
async def get_city(city_id: str):
    """Get specific city details"""
    for city in settings.UAE_CITIES:
        if city["id"] == city_id:
            return city
    return {"error": "City not found"}
