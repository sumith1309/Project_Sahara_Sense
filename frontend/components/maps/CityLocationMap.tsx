"use client";

import { useEffect, useRef } from 'react';

interface WeatherData {
  dust: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  risk_level: string;
}

interface CityLocationMapProps {
  lat: number;
  lon: number;
  cityName: string;
  weather?: WeatherData | null;
}

declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

export default function CityLocationMap({ lat, lon, cityName, weather }: CityLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const initMap = () => {
      if (!mapRef.current || mapInstance.current) return;
      
      const L = window.L;
      
      mapInstance.current = L.map(mapRef.current, {
        center: [lat, lon],
        zoom: 12,
        zoomControl: true,
      });

      // Satellite layer (ESRI World Imagery)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19,
      }).addTo(mapInstance.current);

      // Labels overlay
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapInstance.current);

      // Custom marker
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      markerRef.current = L.marker([lat, lon], { icon: customIcon }).addTo(mapInstance.current);
    };

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.body.appendChild(script);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lon]);

  // Update marker popup with weather data
  useEffect(() => {
    if (markerRef.current && weather && window.L) {
      const riskColors: Record<string, string> = {
        LOW: '#22c55e', MODERATE: '#f59e0b', HIGH: '#f97316', SEVERE: '#ef4444', EXTREME: '#a855f7'
      };
      
      const popupContent = `
        <div style="font-family: system-ui; min-width: 160px; padding: 4px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #18181b;">${cityName}</div>
          <div style="font-size: 12px; color: #52525b; line-height: 1.8;">
            <div>Dust: <strong>${weather.dust.toFixed(1)} μg/m³</strong></div>
            <div>Temp: <strong>${weather.temperature.toFixed(1)}°C</strong></div>
            <div>Humidity: <strong>${weather.humidity.toFixed(0)}%</strong></div>
            <div>Wind: <strong>${weather.wind_speed.toFixed(1)} km/h</strong></div>
            <div style="margin-top: 6px; padding: 3px 10px; background: ${riskColors[weather.risk_level] || '#22c55e'}; color: white; border-radius: 4px; display: inline-block; font-size: 11px; font-weight: 600;">
              ${weather.risk_level} RISK
            </div>
          </div>
        </div>
      `;
      markerRef.current.bindPopup(popupContent).openPopup();
    }
  }, [weather, cityName]);

  return <div ref={mapRef} className="w-full h-full" />;
}
