"""
AQICN (World Air Quality Index) - FREE with API Key
URL: https://api.waqi.info/
Best for: Real-time AQI, PM2.5, PM10 from ground stations
Get free key at: https://aqicn.org/data-platform/token/
"""
import aiohttp
from typing import Dict, Optional
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class AQICNSource:
    name = "AQICN"
    weight = 0.20
    requires_key = True

    def __init__(self):
        self.base_url = "https://api.waqi.info/feed/geo"
        self.api_key = settings.AQICN_API_KEY

    async def fetch(self, session: aiohttp.ClientSession, lat: float, lon: float) -> Optional[Dict]:
        """Fetch air quality data from AQICN"""
        if not self.api_key:
            return None

        try:
            url = f"{self.base_url}:{lat};{lon}/"
            params = {"token": self.api_key}

            async with session.get(url, params=params, timeout=10) as response:
                if response.status != 200:
                    return None
                
                data = await response.json()
                
                if data.get("status") != "ok":
                    return None

                aqi_data = data.get("data", {})
                iaqi = aqi_data.get("iaqi", {})

                return {
                    "source": self.name,
                    "aqi": aqi_data.get("aqi"),
                    "pm10": iaqi.get("pm10", {}).get("v"),
                    "pm2_5": iaqi.get("pm25", {}).get("v"),
                    "temperature": iaqi.get("t", {}).get("v"),
                    "humidity": iaqi.get("h", {}).get("v"),
                    "wind_speed": iaqi.get("w", {}).get("v"),
                    "pressure": iaqi.get("p", {}).get("v"),
                    "dominant_pollutant": aqi_data.get("dominentpol"),
                    "station_name": aqi_data.get("city", {}).get("name")
                }
        except Exception as e:
            logger.error(f"AQICN error: {e}")
            return None
