"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api, CityDustData } from "@/lib/api";

declare global {
  interface Window {
    L: any;
  }
}

interface SatelliteViewProps {
  className?: string;
}

// Layer options for different views
const LAYER_OPTIONS = [
  { id: "satellite", name: "Satellite", icon: "🛰️", description: "High-res satellite imagery with dust levels" },
  { id: "dust", name: "Dust/PM", icon: "🌫️", description: "Particulate matter concentration by city" },
  { id: "wind", name: "Wind", icon: "💨", description: "Wind speed across UAE cities" },
  { id: "temp", name: "Temperature", icon: "🌡️", description: "Surface temperature by city" },
];

export default function SatelliteView({ className = "" }: SatelliteViewProps) {
  const [activeLayer, setActiveLayer] = useState("satellite");
  const [cities, setCities] = useState<CityDustData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCity, setSelectedCity] = useState<CityDustData | null>(null);
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  // Suppress unused variable warning
  void selectedCity;

  // Fetch real-time city data
  const fetchCityData = useCallback(async () => {
    try {
      const response = await api.getCurrentDust();
      setCities(response.cities || []);
    } catch (error) {
      console.error("Failed to fetch city data:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchCityData();
    setLoading(false);

    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    const dataInterval = setInterval(fetchCityData, 30000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, [fetchCityData]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mounted || !mapRef.current || mapInstance.current) return;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css-sat")) {
      const link = document.createElement("link");
      link.id = "leaflet-css-sat";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!mapRef.current || mapInstance.current) return;

      const L = window.L;

      // Create map centered on UAE
      mapInstance.current = L.map(mapRef.current, {
        center: [24.5, 54.5],
        zoom: 7,
        zoomControl: true,
        attributionControl: true,
      });

      // Add satellite base layer (ESRI World Imagery)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "© Esri",
          maxZoom: 18,
        }
      ).addTo(mapInstance.current);

      // Add labels overlay
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 18,
        }
      ).addTo(mapInstance.current);
    };

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.body.appendChild(script);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [mounted]);

  // Update markers when cities data or layer changes
  useEffect(() => {
    if (!mapInstance.current || !window.L || cities.length === 0) return;

    const L = window.L;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Get display value and color based on active layer
    const getDisplayData = (city: CityDustData) => {
      switch (activeLayer) {
        case "dust":
          return {
            value: city.dust?.toFixed(0) || "?",
            unit: "μg/m³",
            color: getRiskColor(city.risk_level),
            label: "Dust"
          };
        case "wind":
          const windSpeed = city.wind_speed || 0;
          const windColor = windSpeed > 30 ? "#ef4444" : windSpeed > 20 ? "#f97316" : windSpeed > 10 ? "#f59e0b" : "#10b981";
          return {
            value: city.wind_speed?.toFixed(0) || "?",
            unit: "km/h",
            color: windColor,
            label: "Wind"
          };
        case "temp":
          const temp = city.temperature || 0;
          const tempColor = temp > 40 ? "#ef4444" : temp > 35 ? "#f97316" : temp > 30 ? "#f59e0b" : temp > 25 ? "#22c55e" : "#3b82f6";
          return {
            value: city.temperature?.toFixed(0) || "?",
            unit: "°C",
            color: tempColor,
            label: "Temp"
          };
        default: // satellite
          return {
            value: city.dust?.toFixed(0) || "?",
            unit: "μg/m³",
            color: getRiskColor(city.risk_level),
            label: "Dust"
          };
      }
    };

    // Add markers for each city
    cities.forEach((city) => {
      const displayData = getDisplayData(city);

      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="position: relative;">
            <div style="
              width: 44px; 
              height: 44px; 
              background: ${displayData.color}; 
              border: 3px solid white; 
              border-radius: 50%; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.4);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: bold;
              color: white;
              line-height: 1.1;
            ">
              <span>${displayData.value}</span>
              <span style="font-size: 7px; opacity: 0.9;">${displayData.unit}</span>
            </div>
            <div style="
              position: absolute;
              top: -10px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0,0,0,0.85);
              color: white;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 10px;
              white-space: nowrap;
              font-weight: 600;
            ">${city.city_name}</div>
          </div>
        `,
        iconSize: [44, 54],
        iconAnchor: [22, 27],
      });

      const marker = L.marker([city.lat, city.lon], { icon }).addTo(
        mapInstance.current!
      );

      // Add popup with detailed info
      const popupContent = `
        <div style="font-family: system-ui; min-width: 200px; padding: 8px;">
          <div style="font-weight: 700; font-size: 16px; margin-bottom: 12px; color: #18181b;">${city.city_name}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
            <div>
              <div style="color: #71717a;">Dust Level</div>
              <div style="font-weight: 600; color: ${getRiskColor(city.risk_level)};">${city.dust?.toFixed(1)} μg/m³</div>
            </div>
            <div>
              <div style="color: #71717a;">Risk Level</div>
              <div style="font-weight: 600; color: ${getRiskColor(city.risk_level)};">${city.risk_level}</div>
            </div>
            <div>
              <div style="color: #71717a;">Temperature</div>
              <div style="font-weight: 600; color: #18181b;">${city.temperature?.toFixed(1)}°C</div>
            </div>
            <div>
              <div style="color: #71717a;">Humidity</div>
              <div style="font-weight: 600; color: #18181b;">${city.humidity?.toFixed(0)}%</div>
            </div>
            <div>
              <div style="color: #71717a;">Wind Speed</div>
              <div style="font-weight: 600; color: #18181b;">${city.wind_speed?.toFixed(1)} km/h</div>
            </div>
            <div>
              <div style="color: #71717a;">Visibility</div>
              <div style="font-weight: 600; color: #18181b;">${city.visibility ? (city.visibility / 1000).toFixed(1) : "-"} km</div>
            </div>
            <div>
              <div style="color: #71717a;">AQI</div>
              <div style="font-weight: 600; color: #18181b;">${city.aqi || "-"}</div>
            </div>
            <div>
              <div style="color: #71717a;">PM2.5</div>
              <div style="font-weight: 600; color: #18181b;">${city.pm2_5?.toFixed(1) || "-"} μg/m³</div>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });
  }, [cities, activeLayer]);

  // Change map layer based on selection
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    const L = window.L;

    // Remove existing overlay layers
    mapInstance.current.eachLayer((layer: any) => {
      if (layer.options?.className === "weather-layer") {
        mapInstance.current?.removeLayer(layer);
      }
    });

    // For satellite mode, just show the base satellite imagery
    // For other modes, we'll update the marker colors based on the data type
    // The markers are updated in the cities useEffect based on activeLayer
  }, [activeLayer]);

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      LOW: "#10b981",
      MODERATE: "#f59e0b",
      HIGH: "#f97316",
      SEVERE: "#ef4444",
      EXTREME: "#8b5cf6",
    };
    return colors[level] || "#6b7280";
  };

  // Calculate averages
  const avgDust = cities.length > 0 ? cities.reduce((s, c) => s + (c.dust || 0), 0) / cities.length : 0;
  const avgTemp = cities.length > 0 ? cities.reduce((s, c) => s + (c.temperature || 0), 0) / cities.length : 0;
  const avgWind = cities.length > 0 ? cities.reduce((s, c) => s + (c.wind_speed || 0), 0) / cities.length : 0;
  const avgHumidity = cities.length > 0 ? cities.reduce((s, c) => s + (c.humidity || 0), 0) / cities.length : 0;

  return (
    <div className={`bg-white/80 backdrop-blur-xl border border-stone-200 rounded-3xl overflow-hidden shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-stone-200" style={{ background: 'linear-gradient(135deg, #C9CCD5 0%, #93B5C6 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4A574 0%, #B8935F 100%)' }}>
              <span className="text-xl">🛰️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-800">Live Satellite & Weather</h3>
              <p className="text-sm text-stone-600">ESRI Imagery • Real-time UAE Data</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-100 border border-green-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-700 font-medium">LIVE</span>
            </div>
            <span className="text-sm text-stone-600 font-mono" suppressHydrationWarning>
              {mounted ? currentTime.toLocaleTimeString() : "--:--:--"}
            </span>
          </div>
        </div>

        {/* Layer Selection */}
        <div className="flex gap-2 flex-wrap">
          {LAYER_OPTIONS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeLayer === layer.id
                  ? "text-white shadow-lg"
                  : "bg-white/70 text-stone-700 hover:bg-white hover:text-stone-900 border border-stone-300"
              }`}
              style={activeLayer === layer.id ? { background: 'linear-gradient(135deg, #D4A574 0%, #B8935F 100%)' } : {}}
            >
              <span>{layer.icon}</span>
              <span>{layer.name}</span>
            </button>
          ))}
        </div>

        <p className="text-stone-600 text-sm mt-3">
          {LAYER_OPTIONS.find((l) => l.id === activeLayer)?.description}
        </p>
      </div>

      {/* Main Map View */}
      <div className="relative" style={{ height: "500px" }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-stone-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-stone-600">Loading satellite imagery...</p>
            </div>
          </div>
        ) : (
          <div ref={mapRef} className="w-full h-full" />
        )}

        {/* Legend - changes based on active layer */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 z-[1000] border border-stone-200 shadow-lg">
          {activeLayer === "dust" || activeLayer === "satellite" ? (
            <>
              <p className="text-xs text-stone-600 mb-2 font-medium">Dust Level (μg/m³)</p>
              <div className="flex gap-3 text-xs">
                {[
                  { color: "#10b981", label: "<50" },
                  { color: "#f59e0b", label: "50-100" },
                  { color: "#f97316", label: "100-200" },
                  { color: "#ef4444", label: ">200" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-stone-700">{label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : activeLayer === "wind" ? (
            <>
              <p className="text-xs text-stone-600 mb-2 font-medium">Wind Speed (km/h)</p>
              <div className="flex gap-3 text-xs">
                {[
                  { color: "#10b981", label: "<10" },
                  { color: "#f59e0b", label: "10-20" },
                  { color: "#f97316", label: "20-30" },
                  { color: "#ef4444", label: ">30" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-stone-700">{label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-stone-600 mb-2 font-medium">Temperature (°C)</p>
              <div className="flex gap-3 text-xs">
                {[
                  { color: "#3b82f6", label: "<25" },
                  { color: "#22c55e", label: "25-30" },
                  { color: "#f59e0b", label: "30-35" },
                  { color: "#f97316", label: "35-40" },
                  { color: "#ef4444", label: ">40" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-stone-700">{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Real-time Stats Footer */}
      <div className="p-4 border-t border-stone-200 bg-stone-50/50">
        {/* UAE Average Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="p-3 rounded-xl bg-white/80 border border-stone-200 shadow-sm">
            <p className="text-xs text-stone-600">UAE Avg Dust</p>
            <p className="text-xl font-bold" style={{ color: '#D4A574' }}>{avgDust.toFixed(1)} <span className="text-xs">μg/m³</span></p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 border border-stone-200 shadow-sm">
            <p className="text-xs text-stone-600">UAE Avg Temp</p>
            <p className="text-xl font-bold text-red-600">{avgTemp.toFixed(1)}°C</p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 border border-stone-200 shadow-sm">
            <p className="text-xs text-stone-600">UAE Avg Wind</p>
            <p className="text-xl font-bold" style={{ color: '#93B5C6' }}>{avgWind.toFixed(1)} <span className="text-xs">km/h</span></p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 border border-stone-200 shadow-sm">
            <p className="text-xs text-stone-600">UAE Avg Humidity</p>
            <p className="text-xl font-bold text-blue-600">{avgHumidity.toFixed(0)}%</p>
          </div>
        </div>

        {/* City Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cities.slice(0, 8).map((city) => (
            <div
              key={city.city_id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/70 hover:bg-white border border-stone-200 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedCity(city);
                if (mapInstance.current) {
                  mapInstance.current.setView([city.lat, city.lon], 10);
                }
              }}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getRiskColor(city.risk_level) }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">{city.city_name}</p>
                <p className="text-xs text-stone-600">
                  {city.dust?.toFixed(0)} μg/m³ • {city.temperature?.toFixed(0)}°C
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
          <div className="flex items-center gap-4 text-sm text-stone-600">
            <span>Sources: ESRI, Open-Meteo, OpenWeatherMap</span>
            <span>•</span>
            <span>Updates: Every 30s</span>
          </div>
          <div className="text-sm text-stone-500">
            {cities.length} cities monitored
          </div>
        </div>
      </div>
    </div>
  );
}
