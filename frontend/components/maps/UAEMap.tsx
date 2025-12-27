"use client";

import { useEffect, useRef, useState } from 'react';
import { CityDustData } from '@/lib/api';

interface UAEMapProps {
  cities: CityDustData[];
  onCitySelect?: (cityId: string) => void;
}

const riskColors: Record<string, string> = {
  LOW: '#10b981',
  MODERATE: '#f59e0b',
  HIGH: '#f97316',
  SEVERE: '#ef4444',
  EXTREME: '#8b5cf6'
};



export default function UAEMap({ cities, onCitySelect }: UAEMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  const UAE_CENTER = { lat: 24.5, lon: 54.5 };

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setMapLoaded(true);
        document.body.appendChild(script);
      } else if (window.L) {
        setMapLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.L) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Initialize map
    const map = window.L.map(mapRef.current, {
      center: [UAE_CENTER.lat, UAE_CENTER.lon],
      zoom: 7,
      minZoom: 6,
      maxZoom: 12
    });

    mapInstanceRef.current = map;

    // Dark tile layer
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap, ©CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Add city markers
    cities.forEach(city => {
      const color = riskColors[city.risk_level] || riskColors.LOW;

      const marker = window.L.circleMarker([city.lat, city.lon], {
        radius: Math.max(15, Math.min(35, (city.dust || 20) / 3)),
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.5
      }).addTo(map);

      const popupContent = `
        <div style="font-family: system-ui; min-width: 180px;">
          <h3 style="margin: 0 0 8px 0; color: ${color}; font-size: 16px;">${city.city_name}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 13px;">
            <span style="color: #888;">Dust:</span>
            <span style="font-weight: bold; color: ${color};">${city.dust?.toFixed(1)} μg/m³</span>
            <span style="color: #888;">Risk:</span>
            <span style="font-weight: bold; color: ${color};">${city.risk_level}</span>
            <span style="color: #888;">PM10:</span>
            <span>${city.pm10?.toFixed(1) || '-'}</span>
            <span style="color: #888;">Wind:</span>
            <span>${city.wind_speed?.toFixed(0) || '-'} km/h</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { className: 'dark-popup' });

      marker.on('click', () => {
        onCitySelect?.(city.city_id);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, cities, onCitySelect]);

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-gray-700">
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 z-[1000]">
        <p className="text-xs text-gray-400 mb-2">Risk Level</p>
        <div className="space-y-1">
          {Object.entries(riskColors).map(([level, color]) => (
            <div key={level} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-gray-300">{level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #1f2937;
          color: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .dark-popup .leaflet-popup-tip {
          background: #1f2937;
        }
        .dark-popup .leaflet-popup-close-button {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
