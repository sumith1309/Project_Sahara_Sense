from fastapi import APIRouter, HTTPException
from typing import Dict
import aiohttp
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

UAE_AIRPORTS = [
    {"icao": "OMDB", "name": "Dubai International", "lat": 25.2528, "lon": 55.3644},
    {"icao": "OMDW", "name": "Al Maktoum International", "lat": 24.8967, "lon": 55.1614},
    {"icao": "OMAA", "name": "Abu Dhabi International", "lat": 24.4330, "lon": 54.6511},
    {"icao": "OMSJ", "name": "Sharjah International", "lat": 25.3286, "lon": 55.5172},
    {"icao": "OMRK", "name": "Ras Al Khaimah", "lat": 25.6133, "lon": 55.9389},
    {"icao": "OMFJ", "name": "Fujairah International", "lat": 25.1122, "lon": 56.3240}
]

@router.get("/airports")
async def get_uae_airports():
    """Get list of UAE airports"""
    return {"airports": UAE_AIRPORTS}

@router.get("/metar")
async def get_metar_data():
    """Get METAR data for all UAE airports"""
    results = []
    
    async with aiohttp.ClientSession() as session:
        for airport in UAE_AIRPORTS:
            try:
                metar_data = await fetch_metar(session, airport["icao"])
                results.append({
                    "icao": airport["icao"],
                    "name": airport["name"],
                    **metar_data
                })
            except Exception as e:
                logger.error(f"METAR error for {airport['icao']}: {e}")
                results.append({
                    "icao": airport["icao"],
                    "name": airport["name"],
                    "visibility": 10000,
                    "dustCondition": "Unknown"
                })

    return {
        "airports": results,
        "updated": datetime.utcnow().isoformat()
    }

@router.get("/metar/{icao}")
async def get_airport_metar(icao: str):
    """Get METAR data for specific airport"""
    airport = next((a for a in UAE_AIRPORTS if a["icao"] == icao.upper()), None)
    if not airport:
        raise HTTPException(status_code=404, detail=f"Airport {icao} not found")

    async with aiohttp.ClientSession() as session:
        metar_data = await fetch_metar(session, icao.upper())

    return {
        **airport,
        **metar_data,
        "updated": datetime.utcnow().isoformat()
    }

async def fetch_metar(session: aiohttp.ClientSession, icao: str) -> Dict:
    """Fetch METAR from Aviation Weather API"""
    url = f"https://aviationweather.gov/api/data/metar?ids={icao}&format=json"
    
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
            if response.status == 200:
                data = await response.json()
                if data and len(data) > 0:
                    metar = data[0]
                    
                    visibility = metar.get("visib")
                    if visibility == "10+":
                        visibility_meters = 16000
                    elif visibility:
                        try:
                            visibility_meters = float(visibility) * 1609.34
                        except Exception:
                            visibility_meters = 10000
                    else:
                        visibility_meters = 10000

                    wx_string = metar.get("wxString", "")
                    dust_condition = "Clear"
                    if "DU" in wx_string or "SA" in wx_string:
                        dust_condition = "Dust/Sand"
                    elif "HZ" in wx_string:
                        dust_condition = "Haze"

                    return {
                        "metar": metar.get("rawOb", ""),
                        "visibility": visibility_meters,
                        "dustCondition": dust_condition,
                        "temperature": metar.get("temp"),
                        "wind_speed": metar.get("wspd"),
                        "flight_category": metar.get("fltcat")
                    }
    except Exception as e:
        logger.warning(f"Aviation API error for {icao}: {e}")

    return {
        "visibility": 10000,
        "dustCondition": "Unknown",
        "metar": None
    }
