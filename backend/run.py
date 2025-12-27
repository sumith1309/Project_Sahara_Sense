#!/usr/bin/env python3
"""
HABOOB.ai Backend Startup Script
Run with: python run.py
"""
import uvicorn
import sys
import os

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting HABOOB.ai Backend Server...")
    print("📡 API Docs: http://localhost:8001/api/docs")
    print("🔌 WebSocket: ws://localhost:8001/ws")
    print("❤️  Health: http://localhost:8001/health")
    print("-" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
