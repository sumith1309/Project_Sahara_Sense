const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export interface CityDustData {
  city_id: string;
  city_name: string;
  lat: number;
  lon: number;
  timestamp: string;
  dust: number;
  pm10: number;
  pm2_5: number;
  aqi: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  visibility: number;
  pressure?: number;
  uv_index?: number;
  risk_level: string;
  risk_score: number;
  confidence: number;
  sources_used: number;
  sources_list?: string[];
  trend: string;
  forecast_24h: ForecastPoint[];
  forecast_72h: ForecastPoint[];
  aviation_data?: AviationData;
  data_quality?: string;
  next_risk_period?: RiskPeriod;
}

export interface AviationData {
  airport: string;
  flight_category: string;
  has_dust: boolean;
  raw_metar: string;
}

export interface ForecastPoint {
  hour: number;
  time: string;
  dust: number;
  confidence: number;
  risk_level: string;
}

export interface PredictionData {
  city_id: string;
  generated_at: string;
  model_version?: string;
  forecast_24h: ForecastPoint[];
  forecast_72h: ForecastPoint[];
  risk_periods: RiskPeriod[];
  next_risk_period?: RiskPeriod;
  summary: {
    peak_dust: number;
    peak_hour: number;
    peak_time?: string;
    min_dust: number;
    avg_dust: number;
    hours_above_moderate?: number;
    hours_above_high?: number;
    hours_above_severe?: number;
  };
  accuracy_info?: AccuracyInfo;
  model_weights?: Record<string, number>;
  data_quality?: DataQuality;
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

export interface AnalyticsOverview {
  total_readings: number;
  avg_dust_24h: number;
  max_dust_24h: number;
  min_dust_24h: number;
  active_alerts: number;
  model_accuracy: AccuracyInfo;
  cities_monitored: number;
  last_updated: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  async getCurrentDust(): Promise<{ cities: CityDustData[]; count: number; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/dust/current`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async getCityDust(cityId: string): Promise<CityDustData> {
    const response = await fetch(`${this.baseUrl}/api/v1/dust/current/${cityId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async getCityHistory(cityId: string, hours: number = 24): Promise<{ city_id: string; data: CityDustData[] }> {
    const response = await fetch(`${this.baseUrl}/api/v1/dust/history/${cityId}?hours=${hours}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async getPrediction(cityId: string): Promise<PredictionData> {
    const response = await fetch(`${this.baseUrl}/api/v1/predictions/${cityId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async getCities(): Promise<{ count: number; cities: Array<{ id: string; name: string; lat: number; lon: number }> }> {
    const response = await fetch(`${this.baseUrl}/api/v1/cities`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async getAlerts(): Promise<{ count: number; alerts: Alert[] }> {
    const response = await fetch(`${this.baseUrl}/api/v1/alerts`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async getActiveAlerts(): Promise<{ count: number; alerts: Alert[] }> {
    const response = await fetch(`${this.baseUrl}/api/v1/alerts/active`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const response = await fetch(`${this.baseUrl}/api/v1/analytics/overview`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async getCityAnalytics(cityId: string, hours: number = 168): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/analytics/history/${cityId}?hours=${hours}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async getAccuracyOverall(): Promise<AccuracyInfo> {
    const response = await fetch(`${this.baseUrl}/api/v1/accuracy/overall`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async getCityAccuracy(cityId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/accuracy/city/${cityId}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async getAviationMetar(): Promise<{ airports: any[]; updated: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/aviation/metar`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async getHealth(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async getDetailedHealth(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/health/detailed`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  connectWebSocket(onMessage: (data: any) => void): WebSocket | null {
    if (typeof window === 'undefined') return null;
    
    const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        // Handle pong response
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Ping every 30 seconds
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 30000);

    (ws as any)._pingInterval = pingInterval;

    return ws;
  }
}

export const api = new ApiClient();
export default api;
