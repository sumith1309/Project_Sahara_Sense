"""
Aviation Weather (NOAA) - FREE, No API Key Required
URL: https://aviationweather.gov/api/
Best for: METAR data, visibility, airport conditions
Critical for aviation clients!
"""
import aiohttp
from typing import Dict, Optional, List
import logging
import re

logger = logging.getLogger(__name__)

# UAE Airport ICAO codes
UAE_AIRPORTS = {
    "dubai": ["OMDB", "OMDW"],  # Dubai International, Al Maktoum
    "abu_dhabi": ["OMAA"],      # Abu Dhabi International
    "sharjah": ["OMSJ"],        # Sharjah International
    "al_ain": ["OMAL"],         # Al Ain International
    "ras_al_khaimah": ["OMRK"], # Ras Al Khaimah
    "fujairah": ["OMFJ"],       # Fujairah International
}

class AviationWeatherSource:
    name = "AviationWeather"
    weight = 0.15
    requires_key = False

    def __init__(self):
        self.metar_url = "https://aviationweather.gov/api/data/metar"

    async def fetch(self, session: aiohttp.ClientSession, lat: float, lon: float, city_id: str = None) -> Optional[Dict]:
        """Fetch METAR data for nearest UAE airport"""
        try:
            # Get airport codes for the city
            airports = self._get_nearest_airports(lat, lon, city_id)
            if not airports:
                return None

            for icao in airports:
                params = {
                    "ids": icao,
                    "format": "json"
                }

                async with session.get(self.metar_url, params=params, timeout=10) as response:
                    if response.status != 200:
                        continue
                    
                    data = await response.json()
                    if not data:
                        continue

                    metar = data[0] if isinstance(data, list) else data
                    
                    return {
                        "source": self.name,
                        "airport": icao,
                        "visibility": self._parse_visibility(metar.get("visib")),
                        "wind_speed": self._knots_to_kmh(metar.get("wspd")),
                        "wind_direction": metar.get("wdir"),
                        "wind_gust": self._knots_to_kmh(metar.get("wgst")),
                        "temperature": metar.get("temp"),
                        "dewpoint": metar.get("dewp"),
                        "altimeter": metar.get("altim"),
                        "clouds": metar.get("clouds"),
                        "raw_metar": metar.get("rawOb"),
                        "flight_category": metar.get("fltcat"),  # VFR, MVFR, IFR, LIFR
                        "has_dust": self._check_dust_conditions(metar)
                    }

            return None
        except Exception as e:
            logger.error(f"AviationWeather error: {e}")
            return None

    def _get_nearest_airports(self, lat: float, lon: float, city_id: str = None) -> List[str]:
        """Get nearest airport ICAO codes"""
        if city_id and city_id in UAE_AIRPORTS:
            return UAE_AIRPORTS[city_id]
        
        # Default to Dubai airports
        return ["OMDB", "OMAA"]

    def _parse_visibility(self, visib) -> Optional[float]:
        """Convert visibility to meters"""
        if visib is None:
            return None
        try:
            # METAR visibility is in statute miles
            return float(visib) * 1609.34  # Convert to meters
        except:
            return None

    def _knots_to_kmh(self, knots) -> Optional[float]:
        """Convert knots to km/h"""
        if knots is None:
            return None
        try:
            return float(knots) * 1.852
        except:
            return None

    def _check_dust_conditions(self, metar: Dict) -> bool:
        """Check if METAR indicates dust/sand conditions"""
        raw = metar.get("rawOb", "")
        dust_indicators = ["DU", "SA", "DS", "SS", "HZ", "FU"]  # Dust, Sand, Dust Storm, Sand Storm, Haze, Smoke
        return any(indicator in raw for indicator in dust_indicators)
