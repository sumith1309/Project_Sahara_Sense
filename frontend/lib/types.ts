export interface City {
  id: string;
  name: string;
  lat: number;
  lon: number;
  icon: string;
  population: number;
  airports?: string[];
}

export interface DustReading {
  city_id: string;
  city_name: string;
  icon?: string;
  lat: number;
  lon: number;
  timestamp: string;
  dust: number;
  pm10: number;
  pm2_5: number;
  aqi: number;
  visibility: number;
  wind_speed: number;
  wind_direction: number;
  humidity: number;
  temperature: number;
  confidence: number;
  sources_used: number;
  sources_list?: string[];
  risk_level: RiskLevel;
  risk_score: number;
  trend: string;
  data_quality?: string;
  forecast_24h?: ForecastPoint[];
  forecast_72h?: ForecastPoint[];
  next_risk_period?: RiskPeriod;
}

export interface ForecastPoint {
  hour: number;
  time: string;
  dust: number;
  confidence: number;
  risk_level: string;
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' | 'EXTREME' | 'UNKNOWN';

export interface Alert {
  id: string;
  city_id: string;
  city_name: string;
  level: string;
  message: string;
  dust_level: number;
  timestamp: string;
  expires_at?: string;
}

export interface Prediction {
  city_id: string;
  generated_at: string;
  model_version?: string;
  forecast_24h: ForecastPoint[];
  forecast_72h: ForecastPoint[];
  risk_periods: RiskPeriod[];
  next_risk_period?: RiskPeriod;
  summary: PredictionSummary;
  accuracy_info?: AccuracyInfo;
  model_weights?: Record<string, number>;
  data_quality?: DataQuality;
}

export interface PredictionSummary {
  peak_dust: number;
  peak_hour: number;
  peak_time?: string;
  min_dust: number;
  avg_dust: number;
  hours_above_moderate?: number;
  hours_above_high?: number;
  hours_above_severe?: number;
}

export interface RiskPeriod {
  start_hour: number;
  end_hour: number;
  start_time: string;
  end_time: string;
  duration_hours: number;
  peak_dust: number;
  severity: string;
  recommendation: string;
}

export interface AccuracyInfo {
  overall_accuracy: number;
  status: string;
  total_cities: number;
  cities: Record<string, CityAccuracy>;
}

export interface CityAccuracy {
  accuracy: number;
  samples: number;
  last_validated: string;
}

export interface DataQuality {
  is_valid: boolean;
  quality_score: number;
  quality_level: string;
  issues: string[];
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#10B981',
  MODERATE: '#FBBF24',
  HIGH: '#F97316',
  SEVERE: '#EF4444',
  EXTREME: '#A855F7',
  UNKNOWN: '#6B7280',
};

export const RISK_BG_CLASSES: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-500/20',
  MODERATE: 'bg-yellow-500/20',
  HIGH: 'bg-orange-500/20',
  SEVERE: 'bg-red-500/20',
  EXTREME: 'bg-purple-500/20',
  UNKNOWN: 'bg-gray-500/20',
};

export const RISK_TEXT_CLASSES: Record<RiskLevel, string> = {
  LOW: 'text-emerald-400',
  MODERATE: 'text-yellow-400',
  HIGH: 'text-orange-400',
  SEVERE: 'text-red-400',
  EXTREME: 'text-purple-400',
  UNKNOWN: 'text-gray-400',
};
