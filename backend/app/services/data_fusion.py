from typing import Dict, List

class DataFusionEngine:
    """Fuses data from multiple sources using weighted averaging"""
    
    def fuse(self, source_readings: List[Dict]) -> Dict:
        """Combine readings from multiple sources"""
        if not source_readings:
            return self._empty_result()
        
        if len(source_readings) == 1:
            data = source_readings[0]['data']
            return {
                **data,
                'confidence': 0.7  # Single source = lower confidence
            }
        
        # Weighted average for numeric fields
        total_weight = sum(r['weight'] for r in source_readings)
        
        fused = {
            'dust': self._weighted_avg(source_readings, 'dust', total_weight),
            'pm10': self._weighted_avg(source_readings, 'pm10', total_weight),
            'pm2_5': self._weighted_avg(source_readings, 'pm2_5', total_weight),
            'temperature': self._weighted_avg(source_readings, 'temperature', total_weight),
            'humidity': self._weighted_avg(source_readings, 'humidity', total_weight),
            'visibility': self._weighted_avg(source_readings, 'visibility', total_weight),
            'wind_speed': self._weighted_avg(source_readings, 'wind_speed', total_weight),
            'wind_direction': self._weighted_avg(source_readings, 'wind_direction', total_weight),
            'confidence': min(0.95, 0.6 + (len(source_readings) * 0.1)),
            'forecast': source_readings[0]['data'].get('forecast', {})
        }
        
        return fused
    
    def _weighted_avg(self, readings: List[Dict], field: str, total_weight: float) -> float:
        """Calculate weighted average for a field"""
        values = []
        weights = []
        
        for r in readings:
            val = r['data'].get(field)
            if val is not None:
                values.append(val)
                weights.append(r['weight'])
        
        if not values:
            return None
        
        weighted_sum = sum(v * w for v, w in zip(values, weights))
        return round(weighted_sum / sum(weights), 2)
    
    def _empty_result(self) -> Dict:
        return {
            'dust': None,
            'pm10': None,
            'pm2_5': None,
            'temperature': None,
            'humidity': None,
            'visibility': None,
            'wind_speed': None,
            'wind_direction': None,
            'confidence': 0,
            'forecast': {}
        }
