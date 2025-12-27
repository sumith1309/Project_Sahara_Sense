"""
WeatherAPI.com - FREE tier (1M calls/month)
URL: https://www.weatherapi.com/
Best for: Current conditions, forecasts, air quality
Get free key at: https://www.weatherapi.com/signup.aspx
"""
import aiohttp
from typing import Dict, Optional
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class WeatherAPISource:
    name = "WeatherAPI"
    weight = 0.10
    requires_key = True

    def __init__(self):
        self.base_url = "https://api.weatherapi.com/v1"
        self.api_key = settings.WEATHERAPI_KEY

    async def fetch(self, session: aiohttp.ClientSession, lat: float, lon: float) -> Optional[Dict]:
        """Fetch current weather and air quality"""
        if not self.api_key:
            return None

        try:
            url = f"{self.base_url}/current.json"
            params = {
                "key": self.api_key,
                "q": f"{lat},{lon}",
                "aqi": "yes"
            }

            async with session.get(url, params=params, timeout=10) as response:
                if response.status != 200:
                    return None
                
                data = await response.json()
                current = data.get("current", {})
                air_quality = current.get("air_quality", {})

                return {
                    "source": self.name,
                    "temperature": current.get("temp_c"),
                    "humidity": current.get("humidity"),
                    "wind_speed": current.get("wind_kph"),
                    "wind_direction": current.get("wind_degree"),
                    "pressure": current.get("pressure_mb"),
                    "visibility": current.get("vis_km", 0) * 1000,  # km to meters
                    "uv_index": current.get("uv"),
                    "clouds": current.get("cloud"),
                    "pm2_5": air_quality.get("pm2_5"),
                    "pm10": air_quality.get("pm10"),
                    "co": air_quality.get("co"),
                    "no2": air_quality.get("no2"),
                    "o3": air_quality.get("o3"),
                    "so2": air_quality.get("so2"),
                    "us_epa_index": air_quality.get("us-epa-index"),
                    "condition": current.get("condition", {}).get("text")
                }
        except Exception as e:
            logger.error(f"WeatherAPI error: {e}")
            return None
