from fastapi import APIRouter, BackgroundTasks
from datetime import datetime

from app.ml.accuracy_tracker import accuracy_tracker
from app.ml.data_quality import data_quality_checker
from app.config import settings

router = APIRouter()


@router.get("/overall")
async def get_overall_accuracy():
    """Get overall system accuracy"""
    return accuracy_tracker.get_overall_accuracy()


@router.get("/city/{city_id}")
async def get_city_accuracy(city_id: str):
    """Get accuracy for specific city"""
    from app.core.database import get_historical_readings
    
    readings = get_historical_readings(city_id, hours=24)
    
    if not readings:
        # Return default response if no readings
        return {
            "city_id": city_id,
            "message": "No readings found for validation",
            "accuracy": None,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    return accuracy_tracker.validate_predictions(city_id, readings)


@router.post("/validate")
async def trigger_validation(background_tasks: BackgroundTasks):
    """Trigger accuracy validation for all cities"""
    background_tasks.add_task(validate_all_cities)
    return {"message": "Validation started", "status": "processing"}


async def validate_all_cities():
    """Background task to validate all cities"""
    from app.core.database import get_historical_readings
    
    for city in settings.UAE_CITIES:
        try:
            readings = get_historical_readings(city['id'], hours=24)
            if readings:
                accuracy_tracker.validate_predictions(city['id'], readings)
        except Exception as e:
            print(f"Validation failed for {city['id']}: {e}")


@router.get("/data-quality")
async def get_data_quality_report():
    """Get data quality report"""
    return data_quality_checker.get_quality_report()


@router.get("/calibration")
async def get_calibration_factors():
    """Get current calibration factors"""
    return {
        "calibration_factors": accuracy_tracker.calibration_factors,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/history/{city_id}")
async def get_accuracy_history(city_id: str, days: int = 7):
    """Get accuracy history for a city"""
    history = accuracy_tracker.accuracy_history.get(city_id, [])
    
    return {
        "city_id": city_id,
        "accuracy_history": history[-days*24:],
        "average": sum(history[-days*24:]) / len(history[-days*24:]) if history else 0,
        "samples": len(history),
        "timestamp": datetime.utcnow().isoformat()
    }
