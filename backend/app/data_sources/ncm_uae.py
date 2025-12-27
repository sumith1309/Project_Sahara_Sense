"""
UAE National Center of Meteorology (NCM) Data Source
https://www.ncm.gov.ae

This is the official UAE government weather service.
Note: NCM doesn't have a public API, so we attempt to fetch from their
internal endpoints or use their data structure as reference.
"""

import httpx
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# NCM AWS (Automatic Weather Stations) approximate locations
# Based on NCM station network across UAE
NCM_STATIONS = {
    "dubai": {
        "stations": ["Dubai International", "Al Maktoum", "Dubai City"],
        "lat": 25.2048,
        "lon": 55.2708
    },
    "abu_dhabi": {
        "stations": ["Abu Dhabi International", "Al Bateen", "Sweihan"],
        "lat": 24.4539,
        "lon": 54.3773
    },
    "sharjah": {
        "stations": ["Sharjah International", "Sharjah City"],
        "lat": 25.3573,
        "lon": 55.4033
    },
    "al_ain": {
        "stations": ["Al Ain International", "Al Ain City", "Jebel Hafeet"],
        "lat": 24.2075,
        "lon": 55.7447
    },
    "ajman": {
        "stations": ["Ajman"],
        "lat": 25.4052,
        "lon": 55.5136
    },
    "ras_al_khaimah": {
        "stations": ["Ras Al Khaimah International", "RAK City"],
        "lat": 25.7895,
        "lon": 55.9432
    },
    "fujairah": {
        "stations": ["Fujairah International", "Fujairah City"],
        "lat": 25.1288,
        "lon": 56.3265
    },
    "umm_al_quwain": {
        "stations": ["Umm Al Quwain"],
        "lat": 25.5647,
        "lon": 55.5532
    }
}

# NCM data endpoints (these may change, need to be verified)
NCM_ENDPOINTS = {
    "aws_data": "https://www.ncm.gov.ae/api/aws-stations",
    "forecast": "https://www.ncm.gov.ae/api/forecast",
    "warnings": "https://www.ncm.gov.ae/api/warnings",
    "dust": "https://www.ncm.gov.ae/api/dust-forecast"
}


class NCMDataSource:
    """
    UAE National Center of Meteorology data source.
    Provides official UAE weather data when available.
    """
    
    def __init__(self):
        self.name = "NCM UAE"
        self.base_url = "https://www.ncm.gov.ae"
        self.timeout = 10.0
        self.last_fetch = None
        self.cached_data = {}
        
    async def fetch_aws_data(self) -> Optional[Dict[str, Any]]:
        """
        Attempt to fetch Automatic Weather Station data from NCM.
        Returns None if the endpoint is not accessible.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Try multiple potential endpoints
                endpoints_to_try = [
                    f"{self.base_url}/api/aws-stations",
                    f"{self.base_url}/api/v1/aws",
                    f"{self.base_url}/maps-aws-stations/api/data",
                ]
                
                for endpoint in endpoints_to_try:
                    try:
                        response = await client.get(
                            endpoint,
                            headers={
                                "Accept": "application/json",
                                "User-Agent": "HABOOB-AI/1.0"
                            }
                        )
                        if response.status_code == 200:
                            data = response.json()
                            logger.info(f"Successfully fetched NCM data from {endpoint}")
                            return data
                    except Exception as e:
                        logger.debug(f"NCM endpoint {endpoint} not accessible: {e}")
                        continue
                        
                logger.warning("NCM API endpoints not accessible - using fallback data")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching NCM data: {e}")
            return None
    
    async def get_city_weather(self, city_id: str) -> Optional[Dict[str, Any]]:
        """
        Get weather data for a specific UAE city.
        Falls back to calibrated estimates if NCM API is not accessible.
        """
        if city_id not in NCM_STATIONS:
            return None
            
        station_info = NCM_STATIONS[city_id]
        
        # Try to fetch real NCM data
        ncm_data = await self.fetch_aws_data()
        
        if ncm_data:
            # Parse NCM response (structure depends on actual API)
            return self._parse_ncm_response(ncm_data, city_id)
        
        # Return None to indicate NCM data not available
        # The data collector will use other sources
        return None
    
    def _parse_ncm_response(self, data: Dict[str, Any], city_id: str) -> Optional[Dict[str, Any]]:
        """
        Parse NCM API response into our standard format.
        This needs to be updated based on actual NCM API structure.
        """
        try:
            # Example parsing - adjust based on actual NCM response format
            station_info = NCM_STATIONS[city_id]
            
            # Look for matching station in response
            for station in data.get("stations", []):
                station_name = station.get("name", "").lower()
                if any(s.lower() in station_name for s in station_info["stations"]):
                    return {
                        "source": "NCM UAE",
                        "city_id": city_id,
                        "temperature": station.get("temperature") or station.get("dry_temperature"),
                        "humidity": station.get("humidity") or station.get("relative_humidity"),
                        "wind_speed": station.get("wind_speed"),
                        "wind_direction": station.get("wind_direction"),
                        "pressure": station.get("pressure") or station.get("atmospheric_pressure"),
                        "visibility": station.get("visibility"),
                        "timestamp": datetime.utcnow().isoformat(),
                        "confidence": 95  # High confidence for official data
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing NCM response: {e}")
            return None
    
    async def get_dust_forecast(self) -> Optional[Dict[str, Any]]:
        """
        Fetch dust/sandstorm forecast from NCM.
        NCM provides official dust warnings for UAE.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/dust-forecast",
                    headers={"Accept": "application/json"}
                )
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            logger.debug(f"NCM dust forecast not accessible: {e}")
        
        return None
    
    async def get_warnings(self) -> List[Dict[str, Any]]:
        """
        Fetch active weather warnings from NCM.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/warnings",
                    headers={"Accept": "application/json"}
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("warnings", [])
        except Exception as e:
            logger.debug(f"NCM warnings not accessible: {e}")
        
        return []


# Singleton instance
_ncm_source = None

def get_ncm_source() -> NCMDataSource:
    global _ncm_source
    if _ncm_source is None:
        _ncm_source = NCMDataSource()
    return _ncm_source


async def fetch_ncm_data(city_id: str) -> Optional[Dict[str, Any]]:
    """
    Convenience function to fetch NCM data for a city.
    """
    source = get_ncm_source()
    return await source.get_city_weather(city_id)
