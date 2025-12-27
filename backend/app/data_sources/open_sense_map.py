"""
openSenseMap API - FREE, No API Key Required
URL: https://api.opensensemap.org/
Best for: Citizen science sensor data, ground truth validation
"""
import aiohttp
from typing import Dict, Optional, List
import logging

logger = logging.getLogger(__name__)

class OpenSenseMapSource:
    name = "openSenseMap"
    weight = 0.10
    requires_key = False

    def __init__(self):
        self.base_url = "https://api.opensensemap.org/boxes"

    async def fetch(self, session: aiohttp.ClientSession, lat: float, lon: float) -> Optional[Dict]:
        """Fetch sensor data from nearby senseBoxes"""
        try:
            # Search for boxes within 50km radius
            params = {
                "near": f"{lon},{lat}",
                "maxDistance": 50000,  # 50km in meters
            }

            async with session.get(self.base_url, params=params, timeout=15) as response:
                if response.status != 200:
                    return None
                
                boxes = await response.json()
                
                if not boxes or not isinstance(boxes, list):
                    return None

                # Aggregate data from nearby sensors
                pm10_values = []
                pm25_values = []
                temp_values = []
                humidity_values = []

                for box in boxes[:10]:  # Limit to 10 nearest boxes
                    if not isinstance(box, dict):
                        continue
                    sensors = box.get("sensors", [])
                    if not isinstance(sensors, list):
                        continue
                    for sensor in sensors:
                        if not isinstance(sensor, dict):
                            continue
                        last_measurement = sensor.get("lastMeasurement", {})
                        if not isinstance(last_measurement, dict):
                            continue
                        value = last_measurement.get("value")
                        
                        if value is None:
                            continue

                        try:
                            value = float(value)
                        except:
                            continue

                        title = sensor.get("title", "").lower()
                        
                        if "pm10" in title:
                            pm10_values.append(value)
                        elif "pm2.5" in title or "pm25" in title:
                            pm25_values.append(value)
                        elif "temp" in title:
                            temp_values.append(value)
                        elif "humid" in title:
                            humidity_values.append(value)

                return {
                    "source": self.name,
                    "pm10": self._average(pm10_values),
                    "pm2_5": self._average(pm25_values),
                    "temperature": self._average(temp_values),
                    "humidity": self._average(humidity_values),
                    "sensor_count": len(boxes) if isinstance(boxes, list) else 0,
                    "data_points": len(pm10_values) + len(pm25_values)
                }
        except Exception as e:
            logger.error(f"openSenseMap error: {e}")
            return None

    def _average(self, values: List[float]) -> Optional[float]:
        """Calculate average of values"""
        if not values:
            return None
        return sum(values) / len(values)
