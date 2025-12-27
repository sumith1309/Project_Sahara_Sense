import pytest
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.ml.accuracy_tracker import AccuracyTracker
from app.ml.data_quality import DataQualityChecker


def test_accuracy_tracker_initialization():
    tracker = AccuracyTracker()
    assert tracker.target_accuracy == 97.0
    assert tracker.min_accuracy == 90.0
    assert tracker.model_version == "6.0.0"


def test_record_prediction():
    tracker = AccuracyTracker()
    tracker.record_prediction(
        city_id="dubai",
        target_time=datetime.utcnow() + timedelta(hours=1),
        predicted_dust=50.0,
        confidence=85.0
    )
    
    assert "dubai" in tracker.prediction_buffer
    assert len(tracker.prediction_buffer["dubai"]) == 1


def test_data_quality_validation():
    checker = DataQualityChecker()
    
    # Valid data
    valid_data = {
        "dust": 50,
        "pm10": 60,
        "temperature": 35,
        "humidity": 40,
        "wind_speed": 15
    }
    
    result = checker.validate_reading(valid_data)
    assert result["is_valid"] == True
    assert result["quality_level"] in ["EXCELLENT", "GOOD"]


def test_data_quality_invalid():
    checker = DataQualityChecker()
    
    # Invalid data (out of range)
    invalid_data = {
        "dust": -10,  # Invalid
        "temperature": 100  # Too high
    }
    
    result = checker.validate_reading(invalid_data)
    assert result["quality_score"] < 100


def test_accuracy_status():
    tracker = AccuracyTracker()
    
    assert tracker._get_accuracy_status(97) == "EXCELLENT"
    assert tracker._get_accuracy_status(90) == "GOOD"
    assert tracker._get_accuracy_status(85) == "ACCEPTABLE"
    assert tracker._get_accuracy_status(70) == "NEEDS_ATTENTION"


def test_trend_calculation():
    tracker = AccuracyTracker()
    
    # Stable trend
    stable = [90, 91, 90, 89, 90, 91, 90, 89, 90, 91]
    assert tracker._calculate_trend(stable) == "STABLE"
    
    # Improving trend
    improving = [80, 82, 84, 86, 88, 90, 92, 94, 96, 98]
    assert tracker._calculate_trend(improving) == "IMPROVING"
    
    # Declining trend
    declining = [98, 96, 94, 92, 90, 88, 86, 84, 82, 80]
    assert tracker._calculate_trend(declining) == "DECLINING"


def test_calibration():
    tracker = AccuracyTracker()
    
    # Initial calibration factor should be 1.0
    assert tracker.apply_calibration("dubai", 100) == 100
    
    # Update calibration
    tracker.update_calibration("dubai", actual_avg=110, predicted_avg=100)
    
    # Should now apply calibration
    calibrated = tracker.apply_calibration("dubai", 100)
    assert calibrated != 100


def test_overall_accuracy_no_data():
    tracker = AccuracyTracker()
    result = tracker.get_overall_accuracy()
    
    assert result["overall_accuracy"] == 92.5
    assert result["status"] == "INITIALIZING"
