from fastapi import APIRouter, HTTPException
import aiohttp

from app.services.prediction_engine import PredictionEngine
from app.services.data_collector import DataCollector
from app.config import settings

router = APIRouter()
prediction_engine = PredictionEngine()

@router.get("/{city_id}")
async def get_predictions(city_id: str, hours: int = 72):
    """Get dust predictions for a city"""
    city = next((c for c in settings.UAE_CITIES if c['id'] == city_id), None)
    if not city:
        raise HTTPException(status_code=404, detail=f"City '{city_id}' not found")

    collector = DataCollector()
    async with aiohttp.ClientSession() as session:
        current_data = await collector.collect_city(session, city)

    predictions = await prediction_engine.predict(city_id, current_data, hours)
    return predictions

@router.get("/{city_id}/risk-periods")
async def get_risk_periods(city_id: str):
    """Get predicted risk periods for a city"""
    city = next((c for c in settings.UAE_CITIES if c['id'] == city_id), None)
    if not city:
        raise HTTPException(status_code=404, detail=f"City '{city_id}' not found")

    collector = DataCollector()
    async with aiohttp.ClientSession() as session:
        current_data = await collector.collect_city(session, city)

    predictions = await prediction_engine.predict(city_id, current_data, 72)
    return {
        "city_id": city_id,
        "risk_periods": predictions.get("risk_periods", [])
    }
