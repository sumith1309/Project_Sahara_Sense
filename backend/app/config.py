from pydantic_settings import BaseSettings
from typing import List, Dict

class Settings(BaseSettings):
    # App
    APP_NAME: str = "HABOOB.ai"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    
    # Database (optional)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/haboob"
    
    # Redis (optional)
    REDIS_URL: str = "redis://localhost:6379"
    
    # API Keys
    # AviationStack - for flight/airport data
    AVIATIONSTACK_API_KEY: str = ""
    
    # Weatherstack - for weather data
    WEATHERSTACK_API_KEY: str = ""
    
    # Other optional API Keys
    AQICN_API_KEY: str = ""
    OPENWEATHER_API_KEY: str = ""
    WEATHERAPI_KEY: str = ""
    
    # Data Collection
    COLLECTION_INTERVAL: int = 60  # seconds
    
    # UAE Cities Configuration
    UAE_CITIES: List[Dict] = [
        {"id": "dubai", "name": "Dubai", "lat": 25.2048, "lon": 55.2708, "icon": "🏙️", "population": 3500000, "airports": ["OMDB", "OMDW"]},
        {"id": "abu_dhabi", "name": "Abu Dhabi", "lat": 24.4539, "lon": 54.3773, "icon": "🕌", "population": 1500000, "airports": ["OMAA"]},
        {"id": "sharjah", "name": "Sharjah", "lat": 25.3573, "lon": 55.4033, "icon": "🏛️", "population": 1800000, "airports": ["OMSJ"]},
        {"id": "al_ain", "name": "Al Ain", "lat": 24.2075, "lon": 55.7447, "icon": "🌴", "population": 800000, "airports": ["OMAL"]},
        {"id": "ajman", "name": "Ajman", "lat": 25.4052, "lon": 55.5136, "icon": "⛵", "population": 500000, "airports": []},
        {"id": "ras_al_khaimah", "name": "Ras Al Khaimah", "lat": 25.7895, "lon": 55.9432, "icon": "🏔️", "population": 400000, "airports": ["OMRK"]},
        {"id": "fujairah", "name": "Fujairah", "lat": 25.1288, "lon": 56.3265, "icon": "🌊", "population": 250000, "airports": ["OMFJ"]},
        {"id": "umm_al_quwain", "name": "Umm Al Quwain", "lat": 25.5647, "lon": 55.5532, "icon": "🐚", "population": 80000, "airports": []},
    ]
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
