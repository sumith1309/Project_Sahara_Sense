"""
AviationStack API - Requires API Key
URL: https://aviationstack.com/
Best for: Real-time flight data, airport information
"""
import aiohttp
from typing import Dict, Optional, List
import logging

from app.config import settings

logger = logging.getLogger(__name__)

# UAE Airport IATA codes
UAE_AIRPORTS = {
    "dubai": ["DXB", "DWC"],
    "abu_dhabi": ["AUH"],
    "sharjah": ["SHJ"],
    "al_ain": ["AAN"],
    "ras_al_khaimah": ["RKT"],
    "fujairah": ["FJR"],
}


class AviationstackSource:
    name = "AviationStack"
    weight = 0.10
    requires_key = True

    def __init__(self):
        self.base_url = "http://api.aviationstack.com/v1"
        self.api_key = settings.AVIATIONSTACK_API_KEY

    async def fetch(self, session: aiohttp.ClientSession, lat: float, lon: float, city_id: str = None) -> Optional[Dict]:
        """Fetch airport/flight data for nearest airport"""
        if not self.api_key:
            return None

        try:
            # Get airport code for city
            airports = self._get_airports(city_id)
            if not airports:
                return None

            airport_code = airports[0]

            # Fetch flights for this airport
            params = {
                "access_key": self.api_key,
                "arr_iata": airport_code,
                "limit": 10
            }

            async with session.get(f"{self.base_url}/flights", params=params, timeout=15) as response:
                if response.status != 200:
                    logger.warning(f"AviationStack API returned {response.status}")
                    return None

                data = await response.json()

                if "error" in data:
                    logger.warning(f"AviationStack error: {data['error']}")
                    return None

                flights = data.get("data", [])

                # Analyze flight delays (can indicate weather issues)
                delayed_flights = 0
                total_flights = len(flights)

                for flight in flights:
                    arrival = flight.get("arrival", {})
                    if arrival.get("delay") and arrival.get("delay") > 15:
                        delayed_flights += 1

                delay_ratio = delayed_flights / total_flights if total_flights > 0 else 0

                return {
                    "source": self.name,
                    "airport": airport_code,
                    "total_flights": total_flights,
                    "delayed_flights": delayed_flights,
                    "delay_ratio": delay_ratio,
                    "weather_impact": self._estimate_weather_impact(delay_ratio),
                    "operational_status": "normal" if delay_ratio < 0.3 else "disrupted"
                }

        except Exception as e:
            logger.error(f"AviationStack error: {e}")
            return None

    def _get_airports(self, city_id: str) -> List[str]:
        """Get airport codes for a city"""
        if city_id and city_id in UAE_AIRPORTS:
            return UAE_AIRPORTS[city_id]
        return ["DXB"]  # Default to Dubai

    def _estimate_weather_impact(self, delay_ratio: float) -> str:
        """Estimate weather impact based on delays"""
        if delay_ratio < 0.1:
            return "minimal"
        elif delay_ratio < 0.3:
            return "moderate"
        elif delay_ratio < 0.5:
            return "significant"
        else:
            return "severe"
