import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json
import os
import logging

logger = logging.getLogger(__name__)

DATABASE_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'haboob.db')

def get_db_connection():
    """Get SQLite database connection"""
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize database tables"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Dust readings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS dust_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city_id TEXT NOT NULL,
            timestamp DATETIME NOT NULL,
            dust REAL,
            pm10 REAL,
            pm2_5 REAL,
            aqi INTEGER,
            temperature REAL,
            humidity REAL,
            wind_speed REAL,
            wind_direction REAL,
            visibility REAL,
            risk_level TEXT,
            risk_score INTEGER,
            confidence REAL,
            sources_used INTEGER,
            raw_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Predictions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city_id TEXT NOT NULL,
            prediction_time DATETIME NOT NULL,
            target_time DATETIME NOT NULL,
            predicted_dust REAL,
            actual_dust REAL,
            model_version TEXT,
            confidence REAL,
            error REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Alerts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city_id TEXT NOT NULL,
            alert_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            message TEXT,
            dust_level REAL,
            triggered_at DATETIME NOT NULL,
            resolved_at DATETIME,
            notified BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Model accuracy table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS model_accuracy (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_name TEXT NOT NULL,
            date DATE NOT NULL,
            predictions_count INTEGER,
            mae REAL,
            rmse REAL,
            accuracy_percent REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Model calibration table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS model_calibration (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city_id TEXT NOT NULL UNIQUE,
            calibration_factor REAL DEFAULT 1.0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_readings_city_time ON dust_readings(city_id, timestamp)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_predictions_city ON predictions(city_id, target_time)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_alerts_city ON alerts(city_id, triggered_at)')

    conn.commit()
    conn.close()
    logger.info("✅ Database initialized")

def save_reading(city_id: str, data: Dict):
    """Save dust reading to database"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO dust_readings 
        (city_id, timestamp, dust, pm10, pm2_5, aqi, temperature, humidity, 
         wind_speed, wind_direction, visibility, risk_level, risk_score, 
         confidence, sources_used, raw_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        city_id,
        data.get('timestamp', datetime.utcnow().isoformat()),
        data.get('dust'),
        data.get('pm10'),
        data.get('pm2_5'),
        data.get('aqi'),
        data.get('temperature'),
        data.get('humidity'),
        data.get('wind_speed'),
        data.get('wind_direction'),
        data.get('visibility'),
        data.get('risk_level'),
        data.get('risk_score'),
        data.get('confidence'),
        data.get('sources_used'),
        json.dumps(data)
    ))

    conn.commit()
    conn.close()

def get_historical_readings(city_id: str, hours: int = 168) -> List[Dict]:
    """Get historical readings for a city (default 7 days)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    since = datetime.utcnow() - timedelta(hours=hours)

    cursor.execute('''
        SELECT * FROM dust_readings 
        WHERE city_id = ? AND timestamp > ?
        ORDER BY timestamp ASC
    ''', (city_id, since.isoformat()))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

def get_all_readings_for_training(days: int = 30) -> List[Dict]:
    """Get all readings for ML training"""
    conn = get_db_connection()
    cursor = conn.cursor()

    since = datetime.utcnow() - timedelta(days=days)

    cursor.execute('''
        SELECT * FROM dust_readings 
        WHERE timestamp > ?
        ORDER BY timestamp ASC
    ''', (since.isoformat(),))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

def save_prediction(city_id: str, prediction_time: datetime, target_time: datetime, 
                   predicted_dust: float, model_version: str, confidence: float):
    """Save prediction for later accuracy validation"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO predictions 
        (city_id, prediction_time, target_time, predicted_dust, model_version, confidence)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (city_id, prediction_time.isoformat(), target_time.isoformat(), 
          predicted_dust, model_version, confidence))

    conn.commit()
    conn.close()

def save_alert(city_id: str, alert_type: str, severity: str, message: str, dust_level: float):
    """Save alert to database"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO alerts 
        (city_id, alert_type, severity, message, dust_level, triggered_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (city_id, alert_type, severity, message, dust_level, datetime.utcnow().isoformat()))

    conn.commit()
    alert_id = cursor.lastrowid
    conn.close()

    return alert_id

def get_active_alerts() -> List[Dict]:
    """Get all active (unresolved) alerts"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT * FROM alerts 
        WHERE resolved_at IS NULL
        ORDER BY triggered_at DESC
    ''')

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

def get_model_accuracy_stats() -> Dict:
    """Get model accuracy statistics"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT 
            AVG(accuracy_percent) as avg_accuracy,
            AVG(mae) as avg_mae,
            AVG(rmse) as avg_rmse,
            COUNT(*) as days_tracked
        FROM model_accuracy
        WHERE date > date('now', '-30 days')
    ''')

    row = cursor.fetchone()
    conn.close()

    if row:
        return dict(row)
    return {'avg_accuracy': 0, 'avg_mae': 0, 'avg_rmse': 0, 'days_tracked': 0}

# Initialize database on import
init_database()
