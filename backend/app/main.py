from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging
from datetime import datetime

from app.api.v1.router import api_router
from app.services.data_collector import DataCollector
from app.services.websocket_manager import WebSocketManager
from app.middleware.security import (
    RateLimitMiddleware,
    SecurityHeadersMiddleware,
    RequestLoggingMiddleware
)
from app.config import settings

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global instances
data_collector = DataCollector()
ws_manager = WebSocketManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting HABOOB.ai Production Server v6.0.0...")
    
    # Start background data collection
    collection_task = asyncio.create_task(data_collector.run_forever(ws_manager))
    
    logger.info("✅ HABOOB.ai Production Ready!")
    yield
    
    collection_task.cancel()
    logger.info("👋 HABOOB.ai shutdown complete")

app = FastAPI(
    title="HABOOB.ai API",
    description="UAE's Most Advanced Sandstorm Prediction System - 7-Model AI Ensemble with 97%+ Accuracy",
    version="6.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Security middleware
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=120)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.get("/")
async def root():
    return {
        "name": "HABOOB.ai",
        "version": "6.0.0",
        "status": "production",
        "timestamp": datetime.utcnow().isoformat(),
        "features": {
            "ml_models": 7,
            "accuracy": "97%+",
            "data_sources": 9,
            "cities": 8
        },
        "endpoints": {
            "api": "/api/v1",
            "docs": "/api/docs",
            "health": "/api/v1/health",
            "accuracy": "/api/v1/accuracy",
            "metrics": "/api/v1/health/metrics",
            "websocket": "/ws"
        }
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "haboob-ai",
        "version": "6.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }
