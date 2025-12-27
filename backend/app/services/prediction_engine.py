"""
Prediction Engine - Wrapper for ML Ensemble Predictor
"""
from typing import Dict
from app.ml.ensemble_predictor import EnsemblePredictor

class PredictionEngine:
    """Wrapper for the ensemble predictor"""
    
    def __init__(self):
        self.ensemble = EnsemblePredictor()
    
    async def predict(self, city_id: str, current_data: Dict, hours_ahead: int = 72) -> Dict:
        """Generate predictions using ensemble model"""
        # Add current data to history for learning
        self.ensemble.add_historical_data(city_id, current_data)
        
        # Generate prediction
        return self.ensemble.predict(city_id, current_data, hours_ahead)
