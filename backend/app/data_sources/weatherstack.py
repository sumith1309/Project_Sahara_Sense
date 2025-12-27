"""
Weatherstack API - Requires API Key
URL: https://weatherstack.com/
Best for: Current weather, historical data
"""
import aiohttp
from typing import Dict, Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class WeatherstackSource:
    name = "Weatherstack"
    weight = 0.15
    requires_key = True

    def __init__(self):
        self.base_url = "http://api.weatherstack.com/current"
        self.api_key = settings.WEATHERSTACK_API_KEY

    async def fetch(self, session: aiohttp.ClientSession, lat: float, lon: float) -> Optional[Dict]:
        """Fetch current weather data"""
        if not self.api_key:
            return None

        try:
            params = {
                "access_key": self.api_key,
                "query": f"{lat},{lon}",
                "units": "m"  # metric
            }

            async with session.get(self.base_url, params=params, timeout=10) as response:
                if response.status != 200:
                    logger.warning(f"Weatherstack API returned {response.status}")
                    return None

                data = await response.json()

                if "error" in data:
                    logger.warning(f"Weatherstack error: {data['error']}")
                    return None

                current = data.get("current", {})

                return {
                    "source": self.name,
                    "temperature": current.get("temperature"),
                    "humidity": current.get("humidity"),
                    "wind_speed": current.get("wind_speed"),
                    "wind_direction": current.get("wind_degree"),
                    "visibility": current.get("visibility", 10) * 1000,  # km to m
                    "pressure": current.get("pressure"),
                    "uv_index": current.get("uv_index"),
                    "cloud_cover": current.get("cloudcover"),
                    "feels_like": current.get("feelslike"),
                    "weather_description": current.get("weather_descriptions", [""])[0],
                    "is_day": current.get("is_day") == "yes"
                }

        except Exception as e:
            logger.error(f"Weatherstack error: {e}")
            return None
