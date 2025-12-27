import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.ml.ensemble_predictor import EnsemblePredictor


def test_predictor_initialization():
    predictor = EnsemblePredictor()
    
    assert predictor.model_version == "5.0.0-production"
    assert sum(predictor.model_weights.values()) == pytest.approx(1.0, rel=0.01)


def test_risk_level_calculation():
    predictor = EnsemblePredictor()
    
    assert predictor._get_risk_level(10) == "LOW"
    assert predictor._get_risk_level(30) == "MODERATE"
    assert predictor._get_risk_level(70) == "HIGH"
    assert predictor._get_risk_level(150) == "SEVERE"
    assert predictor._get_risk_level(250) == "EXTREME"


def test_prediction_output():
    predictor = EnsemblePredictor()
    
    current_data = {
        "dust": 50,
        "temperature": 35,
        "humidity": 40,
        "wind_speed": 15,
        "wind_direction": 180
    }
    
    result = predictor.predict("dubai", current_data, hours_ahead=24)
    
    assert "city_id" in result
    assert result["city_id"] == "dubai"
    assert "forecast_24h" in result
    assert len(result["forecast_24h"]) == 24
    assert "summary" in result
    assert "model_version" in result


def test_prediction_confidence():
    predictor = EnsemblePredictor()
    
    current_data = {
        "dust": 50,
        "temperature": 35,
        "humidity": 40,
        "wind_speed": 15,
        "wind_direction": 180
    }
    
    result = predictor.predict("dubai", current_data, hours_ahead=24)
    
    # Confidence should decrease over time
    first_hour_confidence = result["forecast_24h"][0]["confidence"]
    last_hour_confidence = result["forecast_24h"][23]["confidence"]
    
    assert first_hour_confidence >= last_hour_confidence


def test_seasonal_factors():
    predictor = EnsemblePredictor()
    
    # Summer months should have higher factors
    assert predictor.seasonal_factors[6] > predictor.seasonal_factors[1]
    assert predictor.seasonal_factors[7] > predictor.seasonal_factors[12]


def test_model_weights_update():
    predictor = EnsemblePredictor()
    
    initial_weights = predictor.model_weights.copy()
    
    # Update with performance data
    performance = {
        'pattern': 0.9,
        'weather': 0.85,
        'persistence': 0.8,
        'climatology': 0.75,
        'api_forecast': 0.7
    }
    
    predictor.update_model_weights(performance)
    
    # Weights should have changed
    assert predictor.model_weights != initial_weights
    
    # Weights should still sum to 1
    assert sum(predictor.model_weights.values()) == pytest.approx(1.0, rel=0.01)
