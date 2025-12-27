"""
Open-Meteo API - FREE, No API Key Required
- Air Quality: https://air-quality-api.open-meteo.com/v1/air-quality
- Weather: https://api.open-meteo.com/v1/forecast
Best for: Primary dust data, PM10, PM2.5, weather forecasts
"""
import aiohttp
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class OpenMeteoSource:
    name = "Open-Meteo"
    weight = 0.35  # Primary source
    requires_key = False

    def __init__(self):
        self.air_quality_url = "https://air-quality-api.open-meteo.com/v1/air-quality"
        self.weather_url = "https://api.open-meteo.com/v1/forecast"

    async def fetch(self, session: aiohttp.ClientSession, lat: float, lon: float) -> Optional[Dict]:
        """Fetch air quality and weather data"""
        try:
            # Air quality data
            aq_params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": "dust,pm10,pm2_5,aerosol_optical_depth,uv_index",
                "forecast_days": 5
            }

            # Weather data
            weather_params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": "temperature_2m,relative_humidity_2m,visibility,wind_speed_10m,wind_direction_10m,surface_pressure",
                "forecast_days": 5
            }

            async with session.get(self.air_quality_url, params=aq_params, timeout=10) as aq_response:
                if aq_response.status != 200:
                    return None
                aq_data = await aq_response.json()

            async with session.get(self.weather_url, params=weather_params, timeout=10) as weather_response:
                if weather_response.status != 200:
                    return None
                weather_data = await weather_response.json()

            hourly_aq = aq_data.get("hourly", {})
            hourly_weather = weather_data.get("hourly", {})

            return {
                "source": self.name,
                "dust": hourly_aq.get("dust", [None])[0],
                "pm10": hourly_aq.get("pm10", [None])[0],
                "pm2_5": hourly_aq.get("pm2_5", [None])[0],
                "aod": hourly_aq.get("aerosol_optical_depth", [None])[0],
                "uv_index": hourly_aq.get("uv_index", [None])[0],
                "temperature": hourly_weather.get("temperature_2m", [None])[0],
                "humidity": hourly_weather.get("relative_humidity_2m", [None])[0],
                "visibility": hourly_weather.get("visibility", [None])[0],
                "wind_speed": hourly_weather.get("wind_speed_10m", [None])[0],
                "wind_direction": hourly_weather.get("wind_direction_10m", [None])[0],
                "pressure": hourly_weather.get("surface_pressure", [None])[0],
                "forecast_dust": hourly_aq.get("dust", [])[:120],
                "forecast_pm10": hourly_aq.get("pm10", [])[:120],
                "forecast_times": hourly_aq.get("time", [])[:120]
            }
        except Exception as e:
            logger.error(f"Open-Meteo error: {e}")
            return None
