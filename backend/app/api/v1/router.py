from fastapi import APIRouter
from app.api.v1.endpoints import dust, cities, alerts, predictions, analytics, aviation, accuracy, health

api_router = APIRouter()

api_router.include_router(dust.router, prefix="/dust", tags=["Dust Data"])
api_router.include_router(cities.router, prefix="/cities", tags=["Cities"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(aviation.router, prefix="/aviation", tags=["Aviation"])
api_router.include_router(accuracy.router, prefix="/accuracy", tags=["Accuracy"])
api_router.include_router(health.router, prefix="/health", tags=["Health"])
