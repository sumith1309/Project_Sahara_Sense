"""
7Timer! API - FREE, No API Key Required
URL: http://www.7timer.info/
Best for: 8-day forecasts, astronomy weather
"""
import aiohttp
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class SevenTimerSource:
    name = "7Timer"
    weight = 0.05
    requires_key = False

    def __init__(self):
        self.base_url = "http://www.7timer.info/bin/api.pl"

    async def fetch(self, session: aiohttp.ClientSession, lat: float, lon: float) -> Optional[Dict]:
        """Fetch weather forecast data"""
        try:
            params = {
                "lon": lon,
                "lat": lat,
                "product": "civil",
                "output": "json"
            }

            async with session.get(self.base_url, params=params, timeout=15) as response:
                if response.status != 200:
                    return None
                
                # Handle both JSON and text responses
                content_type = response.headers.get('content-type', '')
                if 'json' in content_type:
                    data = await response.json()
                else:
                    # Try to parse as JSON anyway
                    text = await response.text()
                    try:
                        import json
                        data = json.loads(text)
                    except:
                        return None
                
                dataseries = data.get("dataseries", [])
                
                if not dataseries:
                    return None

                # Get current (first) data point
                current = dataseries[0]

                return {
                    "source": self.name,
                    "temperature": current.get("temp2m"),
                    "humidity": current.get("rh2m"),
                    "wind_speed": self._wind_to_kmh(current.get("wind10m", {}).get("speed")),
                    "wind_direction": self._direction_to_degrees(current.get("wind10m", {}).get("direction")),
                    "cloud_cover": current.get("cloudcover"),
                    "precipitation_type": current.get("prec_type"),
                    "weather": current.get("weather"),
                    "lifted_index": current.get("lifted_index")  # Atmospheric stability
                }
        except Exception as e:
            logger.error(f"7Timer error: {e}")
            return None

    def _wind_to_kmh(self, speed_code) -> Optional[float]:
        """Convert 7Timer wind speed code to km/h"""
        speed_map = {
            1: 2,    # Below 0.3 m/s (calm)
            2: 6,    # 0.3-3.4 m/s (light)
            3: 15,   # 3.4-8.0 m/s (moderate)
            4: 25,   # 8.0-10.8 m/s (fresh)
            5: 35,   # 10.8-17.2 m/s (strong)
            6: 50,   # 17.2-24.5 m/s (gale)
            7: 70,   # 24.5-32.6 m/s (severe gale)
            8: 90    # Over 32.6 m/s (storm)
        }
        return speed_map.get(speed_code)

    def _direction_to_degrees(self, direction: str) -> Optional[float]:
        """Convert direction string to degrees"""
        direction_map = {
            "N": 0, "NE": 45, "E": 90, "SE": 135,
            "S": 180, "SW": 225, "W": 270, "NW": 315
        }
        return direction_map.get(direction)
