from fastapi import APIRouter
from datetime import datetime
import platform
from typing import Dict

router = APIRouter()


@router.get("/")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "5.0.0"
    }


@router.get("/detailed")
async def detailed_health_check():
    """Detailed health check with all components"""
    from app.ml.accuracy_tracker import accuracy_tracker
    from app.ml.data_quality import data_quality_checker
    
    checks = {}
    overall_healthy = True
    
    # Database check
    try:
        from app.core.database import get_db_connection
        conn = get_db_connection()
        conn.execute("SELECT 1")
        conn.close()
        checks["database"] = {"status": "healthy", "message": "Connected"}
    except Exception as e:
        checks["database"] = {"status": "unhealthy", "message": str(e)}
        overall_healthy = False
    
    # Accuracy tracker check
    try:
        accuracy = accuracy_tracker.get_overall_accuracy()
        checks["accuracy_tracker"] = {
            "status": "healthy",
            "overall_accuracy": accuracy.get("overall_accuracy", 0),
            "status_detail": accuracy.get("status", "UNKNOWN")
        }
    except Exception as e:
        checks["accuracy_tracker"] = {"status": "unhealthy", "message": str(e)}
        overall_healthy = False
    
    # Data quality check
    try:
        quality_report = data_quality_checker.get_quality_report()
        checks["data_quality"] = {
            "status": "healthy",
            "cities_monitored": quality_report.get("cities_with_baselines", 0)
        }
    except Exception as e:
        checks["data_quality"] = {"status": "unhealthy", "message": str(e)}
        overall_healthy = False
    
    # System resources
    try:
        import psutil
        checks["system"] = {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent if platform.system() != 'Windows' else psutil.disk_usage('C:').percent,
            "platform": platform.system(),
            "python_version": platform.python_version()
        }
    except:
        checks["system"] = {
            "platform": platform.system(),
            "python_version": platform.python_version()
        }
    
    return {
        "status": "healthy" if overall_healthy else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "5.0.0",
        "checks": checks
    }


@router.get("/metrics")
async def get_metrics():
    """Prometheus-compatible metrics"""
    from app.ml.accuracy_tracker import accuracy_tracker
    
    accuracy = accuracy_tracker.get_overall_accuracy()
    
    metrics = []
    
    # Accuracy metric
    metrics.append(f'haboob_accuracy_percent {accuracy.get("overall_accuracy", 0)}')
    
    # Cities monitored
    metrics.append(f'haboob_cities_total {accuracy.get("total_cities", 0)}')
    
    # System metrics
    try:
        import psutil
        metrics.append(f'haboob_cpu_percent {psutil.cpu_percent()}')
        metrics.append(f'haboob_memory_percent {psutil.virtual_memory().percent}')
    except:
        pass
    
    # Per-city accuracy
    for city_id, stats in accuracy.get("cities", {}).items():
        city_accuracy = stats.get("accuracy", 0)
        metrics.append(f'haboob_city_accuracy{{city="{city_id}"}} {city_accuracy}')
    
    return "\n".join(metrics)


@router.get("/readiness")
async def readiness_check():
    """Kubernetes readiness probe"""
    try:
        from app.core.database import get_db_connection
        conn = get_db_connection()
        conn.execute("SELECT 1")
        conn.close()
        return {"status": "ready"}
    except:
        return {"status": "not_ready"}


@router.get("/liveness")
async def liveness_check():
    """Kubernetes liveness probe"""
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}
