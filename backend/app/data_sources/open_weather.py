"""
OpenWeatherMap API - FREE tier (1000 calls/day)
URL: https://api.openweathermap.org/
Best for: Current weather, air pollution, forecasts
Get free key at: https://openweathermap.org/api
"""
import aiohttp
from typing import Dict, Optional
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class OpenWeatherSource:
    name = "OpenWeatherMap"
    weight = 0.20
    requires_key = True

    def __init__(self):
        self.weather_url = "https://api.openweathermap.org/data/2.5/weather"
        self.air_pollution_url = "https://api.openweathermap.org/data/2.5/air_pollution"
        self.api_key = settings.OPENWEATHER_API_KEY

    async def fetch(self, session: aiohttp.ClientSession, lat: float, lon: float) -> Optional[Dict]:
        """Fetch weather and air pollution data"""
        if not self.api_key:
            return None

        try:
            # Current weather
            weather_params = {
                "lat": lat,
                "lon": lon,
                "appid": self.api_key,
                "units": "metric"
            }

            # Air pollution
            pollution_params = {
                "lat": lat,
                "lon": lon,
                "appid": self.api_key
            }

            weather_data = None
            pollution_data = None

            async with session.get(self.weather_url, params=weather_params, timeout=10) as response:
                if response.status == 200:
                    weather_data = await response.json()

            async with session.get(self.air_pollution_url, params=pollution_params, timeout=10) as response:
                if response.status == 200:
                    pollution_data = await response.json()

            if not weather_data and not pollution_data:
                return None

            result = {"source": self.name}

            if weather_data:
                result.update({
                    "temperature": weather_data.get("main", {}).get("temp"),
                    "humidity": weather_data.get("main", {}).get("humidity"),
                    "pressure": weather_data.get("main", {}).get("pressure"),
                    "visibility": weather_data.get("visibility"),
                    "wind_speed": weather_data.get("wind", {}).get("speed", 0) * 3.6,  # m/s to km/h
                    "wind_direction": weather_data.get("wind", {}).get("deg"),
                    "clouds": weather_data.get("clouds", {}).get("all"),
                    "weather_condition": weather_data.get("weather", [{}])[0].get("main")
                })

            if pollution_data:
                components = pollution_data.get("list", [{}])[0].get("components", {})
                result.update({
                    "pm2_5": components.get("pm2_5"),
                    "pm10": components.get("pm10"),
                    "aqi": pollution_data.get("list", [{}])[0].get("main", {}).get("aqi"),
                    "co": components.get("co"),
                    "no2": components.get("no2"),
                    "o3": components.get("o3"),
                    "so2": components.get("so2")
                })

            return result
        except Exception as e:
            logger.error(f"OpenWeatherMap error: {e}")
            return None
