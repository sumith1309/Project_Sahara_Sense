from typing import Dict, Optional, List
from datetime import datetime

class CacheService:
    """Simple in-memory cache"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._cache = {}
            cls._instance._history = {}
            cls._instance._ttl = 300
        return cls._instance

    async def set_current(self, city_id: str, data: Dict):
        """Store current reading"""
        self._cache[f"current:{city_id}"] = {
            'data': data,
            'timestamp': datetime.utcnow()
        }

        if city_id not in self._history:
            self._history[city_id] = []
        
        self._history[city_id].append(data)
        
        # Keep only last 24 hours
        if len(self._history[city_id]) > 288:
            self._history[city_id] = self._history[city_id][-288:]

    async def get_current(self, city_id: str) -> Optional[Dict]:
        """Get current reading"""
        key = f"current:{city_id}"
        if key in self._cache:
            cached = self._cache[key]
            age = (datetime.utcnow() - cached['timestamp']).seconds
            if age < self._ttl:
                return cached['data']
        return None

    async def get_all_current(self) -> List[Dict]:
        """Get all current city readings"""
        results = []
        for key, value in self._cache.items():
            if key.startswith("current:"):
                age = (datetime.utcnow() - value['timestamp']).seconds
                if age < self._ttl:
                    results.append(value['data'])
        return results

    async def get_history(self, city_id: str, hours: int = 24) -> List[Dict]:
        """Get historical readings"""
        if city_id not in self._history:
            return []
        
        readings_per_hour = 12
        count = hours * readings_per_hour
        return self._history[city_id][-count:]

    async def clear(self):
        """Clear all cache"""
        self._cache.clear()
        self._history.clear()
