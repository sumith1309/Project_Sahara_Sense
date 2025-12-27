import numpy as np
from datetime import datetime, timedelta, timedelta
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class DataQualityChecker:
    """Production-grade data quality validation v2.0
    Advanced validation with outlier detection, temporal consistency, and cross-source verification
    """
    
    def __init__(self):
        # Valid ranges for UAE conditions (refined with meteorological data)
        self.valid_ranges = {
            'dust': (0, 2500),
            'pm10': (0, 3500),
            'pm2_5': (0, 1200),
            'temperature': (-2, 55),
            'humidity': (0, 100),
            'wind_speed': (0, 120),
            'wind_direction': (0, 360),
            'visibility': (0, 100000),
            'aqi': (0, 500),
            'pressure': (950, 1050)
        }
        
        # Expected ranges for UAE (typical values)
        self.expected_ranges = {
            'dust': (5, 200),
            'pm10': (10, 300),
            'pm2_5': (5, 150),
            'temperature': (15, 50),
            'humidity': (10, 90),
            'wind_speed': (0, 50),
            'visibility': (1000, 50000)
        }
        
        self.historical_means: Dict[str, Dict[str, float]] = {}
        self.historical_stds: Dict[str, Dict[str, float]] = {}
        self.recent_readings: Dict[str, List[Dict]] = {}
        self.quality_scores: Dict[str, List[float]] = {}
    
    def validate_reading(self, data: Dict) -> Dict:
        """Comprehensive validation of a single reading"""
        issues = []
        scores = []
        warnings = []
        
        # 1. Range validation
        for field, (min_val, max_val) in self.valid_ranges.items():
            value = data.get(field)
            
            if value is None:
                continue
            elif not isinstance(value, (int, float)):
                issues.append(f"{field}: invalid type ({type(value).__name__})")
                scores.append(0)
            elif value < min_val or value > max_val:
                issues.append(f"{field}: out of valid range ({value})")
                scores.append(0.3)
            else:
                # Check if within expected range
                if field in self.expected_ranges:
                    exp_min, exp_max = self.expected_ranges[field]
                    if value < exp_min or value > exp_max:
                        warnings.append(f"{field}: unusual but valid ({value})")
                        scores.append(0.85)
                    else:
                        scores.append(1.0)
                else:
                    scores.append(1.0)
        
        # 2. Cross-field consistency checks
        consistency_issues = self._check_consistency(data)
        issues.extend(consistency_issues)
        if consistency_issues:
            scores.append(0.7)
        
        # 3. Temporal consistency (if we have recent data)
        city_id = data.get('city_id', 'unknown')
        temporal_issues = self._check_temporal_consistency(city_id, data)
        if temporal_issues:
            warnings.extend(temporal_issues)
            scores.append(0.8)
        
        # 4. Anomaly detection
        anomalies = self._detect_anomalies(data)
        if anomalies:
            warnings.extend(anomalies)
            scores.append(0.85)
        
        # Calculate final quality score
        quality_score = (sum(scores) / len(scores)) * 100 if scores else 50
        
        # Apply penalties for critical issues
        if len(issues) > 3:
            quality_score *= 0.8
        
        # Determine quality level
        if quality_score >= 95:
            quality_level = 'EXCELLENT'
        elif quality_score >= 85:
            quality_level = 'GOOD'
        elif quality_score >= 70:
            quality_level = 'ACCEPTABLE'
        elif quality_score >= 50:
            quality_level = 'FAIR'
        else:
            quality_level = 'POOR'
        
        # Store for tracking
        if city_id not in self.quality_scores:
            self.quality_scores[city_id] = []
        self.quality_scores[city_id].append(quality_score)
        if len(self.quality_scores[city_id]) > 100:
            self.quality_scores[city_id] = self.quality_scores[city_id][-100:]
        
        # Store recent reading for temporal checks
        if city_id not in self.recent_readings:
            self.recent_readings[city_id] = []
        self.recent_readings[city_id].append({
            'timestamp': datetime.utcnow().isoformat(),
            'dust': data.get('dust'),
            'temperature': data.get('temperature')
        })
        if len(self.recent_readings[city_id]) > 50:
            self.recent_readings[city_id] = self.recent_readings[city_id][-50:]
        
        return {
            'quality_score': round(quality_score, 1),
            'quality_level': quality_level,
            'issues': issues,
            'warnings': warnings,
            'is_valid': quality_score >= 50,
            'is_reliable': quality_score >= 70,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _check_consistency(self, data: Dict) -> List[str]:
        """Check cross-field consistency"""
        issues = []
        
        # High dust should correlate with reduced visibility
        dust = data.get('dust', 0)
        visibility = data.get('visibility', 10000)
        if dust > 100 and visibility > 20000:
            issues.append("Inconsistent: high dust with high visibility")
        
        # Very high humidity should reduce dust suspension
        humidity = data.get('humidity', 50)
        if humidity > 90 and dust > 150:
            issues.append("Inconsistent: very high humidity with very high dust")
        
        # PM2.5 should be less than PM10
        pm25 = data.get('pm2_5', 0)
        pm10 = data.get('pm10', 0)
        if pm25 > pm10 * 1.2 and pm10 > 0:
            issues.append("Inconsistent: PM2.5 higher than PM10")
        
        return issues
    
    def _check_temporal_consistency(self, city_id: str, data: Dict) -> List[str]:
        """Check for sudden unrealistic changes"""
        warnings = []
        recent = self.recent_readings.get(city_id, [])
        
        if len(recent) < 3:
            return warnings
        
        current_dust = data.get('dust', 0)
        recent_dust = [r['dust'] for r in recent[-5:] if r.get('dust') is not None]
        
        if recent_dust:
            avg_recent = np.mean(recent_dust)
            # Flag if change is more than 200% in short time
            if current_dust > avg_recent * 3 or (avg_recent > 10 and current_dust < avg_recent * 0.2):
                warnings.append(f"Rapid dust change: {avg_recent:.1f} -> {current_dust:.1f}")
        
        return warnings
    
    def _detect_anomalies(self, data: Dict) -> List[str]:
        """Detect statistical anomalies in data using z-scores"""
        anomalies = []
        city_id = data.get('city_id', 'unknown')
        
        if city_id in self.historical_means:
            means = self.historical_means[city_id]
            stds = self.historical_stds[city_id]
            
            for field in ['dust', 'pm10', 'temperature', 'humidity']:
                value = data.get(field)
                if value is not None and field in means and field in stds:
                    std = max(stds[field], 1)  # Avoid division by zero
                    z_score = abs((value - means[field]) / std)
                    if z_score > 3.5:
                        anomalies.append(f"{field}: statistical anomaly (z={z_score:.1f})")
                    elif z_score > 2.5:
                        anomalies.append(f"{field}: unusual value (z={z_score:.1f})")
        
        return anomalies
    
    def update_baselines(self, city_id: str, readings: List[Dict]):
        """Update historical baselines for anomaly detection"""
        if len(readings) < 48:  # Need at least 2 days of data
            return
        
        means = {}
        stds = {}
        
        for field in ['dust', 'pm10', 'pm2_5', 'temperature', 'humidity', 'wind_speed']:
            values = [r.get(field) for r in readings if r.get(field) is not None]
            if len(values) >= 24:
                # Use robust statistics (trimmed mean)
                sorted_vals = sorted(values)
                trim = len(sorted_vals) // 10
                if trim > 0:
                    trimmed = sorted_vals[trim:-trim]
                else:
                    trimmed = sorted_vals
                means[field] = np.mean(trimmed)
                stds[field] = np.std(trimmed)
        
        self.historical_means[city_id] = means
        self.historical_stds[city_id] = stds
        logger.info(f"Updated baselines for {city_id}: {len(means)} fields")
    
    def validate_batch(self, readings: List[Dict]) -> Dict:
        """Validate a batch of readings with comprehensive metrics"""
        results = [self.validate_reading(r) for r in readings]
        valid_count = sum(1 for r in results if r['is_valid'])
        reliable_count = sum(1 for r in results if r.get('is_reliable', False))
        avg_score = np.mean([r['quality_score'] for r in results]) if results else 0
        
        # Collect all issues
        all_issues = []
        for r in results:
            all_issues.extend(r.get('issues', []))
        
        # Count issue types
        issue_counts = {}
        for issue in all_issues:
            issue_type = issue.split(':')[0] if ':' in issue else issue
            issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1
        
        return {
            'total_readings': len(readings),
            'valid_readings': valid_count,
            'reliable_readings': reliable_count,
            'invalid_readings': len(readings) - valid_count,
            'average_quality_score': round(avg_score, 1),
            'pass_rate': round((valid_count / len(readings)) * 100, 1) if readings else 0,
            'reliability_rate': round((reliable_count / len(readings)) * 100, 1) if readings else 0,
            'issue_summary': issue_counts,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def get_quality_report(self) -> Dict:
        """Get comprehensive data quality report"""
        city_quality = {}
        for city_id, scores in self.quality_scores.items():
            if scores:
                city_quality[city_id] = {
                    'average_score': round(np.mean(scores), 1),
                    'min_score': round(min(scores), 1),
                    'max_score': round(max(scores), 1),
                    'samples': len(scores),
                    'trend': 'IMPROVING' if len(scores) > 5 and np.mean(scores[-5:]) > np.mean(scores[:5]) else 'STABLE'
                }
        
        return {
            'cities_with_baselines': len(self.historical_means),
            'cities_tracked': len(self.quality_scores),
            'city_quality': city_quality,
            'valid_ranges': self.valid_ranges,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def get_city_quality_trend(self, city_id: str) -> Dict:
        """Get quality trend for a specific city"""
        scores = self.quality_scores.get(city_id, [])
        if not scores:
            return {'error': 'No data for city'}
        
        return {
            'city_id': city_id,
            'current_score': round(scores[-1], 1) if scores else 0,
            'average_score': round(np.mean(scores), 1),
            'samples': len(scores),
            'recent_trend': self._calculate_trend(scores),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _calculate_trend(self, scores: List[float]) -> str:
        """Calculate trend from recent scores"""
        if len(scores) < 10:
            return 'INSUFFICIENT_DATA'
        
        recent = np.mean(scores[-5:])
        older = np.mean(scores[-10:-5])
        
        diff = recent - older
        if diff > 3:
            return 'IMPROVING'
        elif diff < -3:
            return 'DECLINING'
        return 'STABLE'


# Global instance
data_quality_checker = DataQualityChecker()
