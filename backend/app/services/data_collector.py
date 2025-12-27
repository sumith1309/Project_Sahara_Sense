"""
Multi-Source Data Collector with Database Persistence
"""
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional
import logging
import random

from app.config import settings
from app.services.cache_service import CacheService
from app.services.prediction_engine import PredictionEngine
from app.core.database import save_reading

from app.data_sources.open_meteo import OpenMeteoSource
from app.data_sources.aqicn import AQICNSource
from app.data_sources.open_weather import OpenWeatherSource
from app.data_sources.aviation_weather import AviationWeatherSource
from app.data_sources.weatherapi import WeatherAPISource
from app.data_sources.seven_timer import SevenTimerSource
from app.data_sources.open_sense_map import OpenSenseMapSource
from app.data_sources.weatherstack import WeatherstackSource
from app.data_sources.aviationstack import AviationstackSource

logger = logging.getLogger(__name__)

class DataCollector:
    def __init__(self):
        self.cache = CacheService()
        self.prediction_engine = PredictionEngine()
        self.collection_interval = settings.COLLECTION_INTERVAL
        self.last_collection = {}
        
        self.sources = [
            OpenMeteoSource(),
            AQICNSource(),
            OpenWeatherSource(),
            AviationWeatherSource(),
            WeatherAPISource(),
            SevenTimerSource(),
            OpenSenseMapSource(),
            WeatherstackSource(),
            AviationstackSource(),
        ]
        
        logger.info(f"Initialized {len(self.sources)} data sources")

    async def run_forever(self, ws_manager=None):
        """Main collection loop"""
        while True:
            try:
                data = await self.collect_all_cities()
                
                if ws_manager and data:
                    await ws_manager.broadcast({
                        "type": "bulk_update",
                        "data": data,
                        "timestamp": datetime.utcnow().isoformat(),
                        "sources_active": self._count_active_sources()
                    })
                
                logger.info(f"✅ Collected {len(data)} cities from {self._count_active_sources()} sources")
            except Exception as e:
                logger.error(f"❌ Collection error: {e}")
            
            await asyncio.sleep(self.collection_interval)

    def _count_active_sources(self) -> int:
        count = 0
        for source in self.sources:
            if not source.requires_key:
                count += 1
            elif source.name == "AQICN" and settings.AQICN_API_KEY:
                count += 1
            elif source.name == "OpenWeatherMap" and settings.OPENWEATHER_API_KEY:
                count += 1
            elif source.name == "WeatherAPI" and settings.WEATHERAPI_KEY:
                count += 1
            elif source.name == "Weatherstack" and settings.WEATHERSTACK_API_KEY:
                count += 1
            elif source.name == "AviationStack" and settings.AVIATIONSTACK_API_KEY:
                count += 1
        return count

    async def collect_all_cities(self) -> List[Dict]:
        all_data = []
        
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as session:
            tasks = [self.collect_city(session, city) for city in settings.UAE_CITIES]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for city, result in zip(settings.UAE_CITIES, results):
                if isinstance(result, Exception):
                    logger.error(f"Failed {city['name']}: {result}")
                    result = await self.get_fallback_data(city)
                
                if result:
                    await self.cache.set_current(city['id'], result)
                    # Save to database
                    try:
                        save_reading(city['id'], result)
                    except Exception as e:
                        logger.error(f"DB save error: {e}")
                    all_data.append(result)

        return all_data

    async def collect_city(self, session: aiohttp.ClientSession, city: Dict) -> Dict:
        sources_data = []
        
        fetch_tasks = []
        for source in self.sources:
            if source.name == "AviationWeather":
                fetch_tasks.append(self._fetch_with_source(session, source, city['lat'], city['lon'], city['id']))
            else:
                fetch_tasks.append(self._fetch_with_source(session, source, city['lat'], city['lon']))
        
        results = await asyncio.gather(*fetch_tasks, return_exceptions=True)
        
        for source, result in zip(self.sources, results):
            if not isinstance(result, Exception) and result:
                sources_data.append({
                    'source': source.name,
                    'weight': source.weight,
                    'data': result
                })

        if not sources_data:
            return await self.get_fallback_data(city)

        fused_data = self.ensemble_fusion(sources_data)
        prediction = await self.prediction_engine.predict(city['id'], fused_data)
        confidence = self.calculate_confidence(sources_data, fused_data)

        return {
            'city_id': city['id'],
            'city_name': city['name'],
            'lat': city['lat'],
            'lon': city['lon'],
            'timestamp': datetime.utcnow().isoformat(),
            'dust': round(fused_data.get('dust') or 0, 2),
            'pm10': round(fused_data.get('pm10') or 0, 2),
            'pm2_5': round(fused_data.get('pm2_5') or 0, 2),
            'aqi': self.calculate_aqi(fused_data),
            'temperature': round(fused_data.get('temperature') or 0, 1),
            'humidity': round(fused_data.get('humidity') or 0, 1),
            'wind_speed': round(fused_data.get('wind_speed') or 0, 1),
            'wind_direction': round(fused_data.get('wind_direction') or 0, 0),
            'visibility': round(fused_data.get('visibility') or 10000, 0),
            'risk_level': self.calculate_risk(fused_data.get('dust') or 0),
            'risk_score': self.calculate_risk_score(fused_data),
            'confidence': round(confidence, 1),
            'sources_used': len(sources_data),
            'sources_list': [s['source'] for s in sources_data],
            'forecast_24h': prediction.get('forecast_24h', []),
            'forecast_72h': prediction.get('forecast_72h', []),
            'next_risk_period': prediction.get('next_risk_period'),
            'trend': self.calculate_trend(city['id'], fused_data.get('dust') or 0),
            'data_quality': self._assess_data_quality(sources_data)
        }

    async def _fetch_with_source(self, session, source, lat, lon, city_id=None):
        try:
            if city_id:
                return await source.fetch(session, lat, lon, city_id)
            return await source.fetch(session, lat, lon)
        except Exception as e:
            return None

    def ensemble_fusion(self, sources_data: List[Dict]) -> Dict:
        result = {}
        numeric_fields = ['dust', 'pm10', 'pm2_5', 'temperature', 'humidity', 
                         'wind_speed', 'wind_direction', 'visibility']
        
        for field in numeric_fields:
            values_weights = []
            for source in sources_data:
                value = source['data'].get(field)
                if value is not None and isinstance(value, (int, float)):
                    values_weights.append((value, source['weight']))
            
            if values_weights:
                # Remove outliers
                values = [v for v, w in values_weights]
                if len(values) >= 3:
                    mean = sum(values) / len(values)
                    std = (sum((v - mean) ** 2 for v in values) / len(values)) ** 0.5
                    if std > 0:
                        values_weights = [(v, w) for v, w in values_weights if abs(v - mean) <= 2 * std]
                
                if values_weights:
                    total_weight = sum(w for v, w in values_weights)
                    result[field] = sum(v * w for v, w in values_weights) / total_weight
        
        # Keep forecast from primary source
        for source in sources_data:
            if source['source'] == 'Open-Meteo':
                result['forecast_dust'] = source['data'].get('forecast_dust', [])
                break
        
        return result

    def calculate_confidence(self, sources_data: List[Dict], fused_data: Dict) -> float:
        base_confidence = 50.0
        source_bonus = min(30, len(sources_data) * 5)
        
        dust_values = [s['data'].get('dust') for s in sources_data if s['data'].get('dust')]
        if len(dust_values) >= 2:
            mean = sum(dust_values) / len(dust_values)
            variance = sum((v - mean) ** 2 for v in dust_values) / len(dust_values)
            std = variance ** 0.5
            if mean > 0:
                cv = std / mean
                agreement_bonus = max(0, 15 - cv * 30)
            else:
                agreement_bonus = 10
        else:
            agreement_bonus = 0
        
        return min(98, base_confidence + source_bonus + agreement_bonus)

    def calculate_aqi(self, data: Dict) -> int:
        pm25 = data.get('pm2_5') or 0
        pm10 = data.get('pm10') or 0
        return max(min(500, int(pm25 * 4.17)), min(500, int(pm10 * 2)))

    def calculate_risk(self, dust: float) -> str:
        if dust < 20: return "LOW"
        elif dust < 50: return "MODERATE"
        elif dust < 100: return "HIGH"
        elif dust < 200: return "SEVERE"
        else: return "EXTREME"

    def calculate_risk_score(self, data: Dict) -> int:
        dust = data.get('dust') or 0
        wind = data.get('wind_speed') or 0
        visibility = data.get('visibility') or 10000
        humidity = data.get('humidity') or 50
        return int(min(50, dust / 4) + min(20, wind / 2) + max(0, 20 - visibility / 500) + max(0, 10 - humidity / 10))

    def calculate_trend(self, city_id: str, current_dust: float) -> str:
        last = self.last_collection.get(city_id, current_dust)
        self.last_collection[city_id] = current_dust
        diff = current_dust - last
        if diff > 5: return "rising"
        elif diff < -5: return "falling"
        else: return "stable"

    def _assess_data_quality(self, sources_data: List[Dict]) -> str:
        if len(sources_data) >= 5: return "excellent"
        elif len(sources_data) >= 3: return "good"
        elif len(sources_data) >= 2: return "fair"
        else: return "limited"

    async def get_fallback_data(self, city: Dict) -> Dict:
        cached = await self.cache.get_current(city['id'])
        if cached:
            cached['timestamp'] = datetime.utcnow().isoformat()
            cached['confidence'] = 40.0
            cached['data_quality'] = 'cached'
            return cached

        base_dust = random.uniform(15, 45)
        return {
            'city_id': city['id'],
            'city_name': city['name'],
            'lat': city['lat'],
            'lon': city['lon'],
            'timestamp': datetime.utcnow().isoformat(),
            'dust': round(base_dust, 2),
            'pm10': round(base_dust * 1.2, 2),
            'pm2_5': round(base_dust * 0.4, 2),
            'aqi': int(base_dust * 2),
            'temperature': round(random.uniform(28, 42), 1),
            'humidity': round(random.uniform(20, 60), 1),
            'wind_speed': round(random.uniform(5, 25), 1),
            'wind_direction': round(random.uniform(0, 360), 0),
            'visibility': round(random.uniform(5000, 15000), 0),
            'risk_level': self.calculate_risk(base_dust),
            'risk_score': int(base_dust),
            'confidence': 25.0,
            'sources_used': 0,
            'sources_list': [],
            'forecast_24h': [],
            'forecast_72h': [],
            'trend': 'stable',
            'data_quality': 'fallback'
        }
