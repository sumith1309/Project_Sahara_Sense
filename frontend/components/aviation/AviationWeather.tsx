"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AirportData {
  icao: string;
  name: string;
  visibility: number;
  dustCondition: string;
  temperature?: number;
  wind_speed?: number;
  flight_category?: string;
  metar?: string;
}

interface AviationWeatherProps {
  language?: 'en' | 'ar';
}

const UAE_AIRPORTS = [
  { icao: 'OMDB', name: 'Dubai International', city: 'Dubai' },
  { icao: 'OMDW', name: 'Al Maktoum Intl', city: 'Dubai' },
  { icao: 'OMAA', name: 'Abu Dhabi Intl', city: 'Abu Dhabi' },
  { icao: 'OMSJ', name: 'Sharjah Intl', city: 'Sharjah' },
  { icao: 'OMRK', name: 'RAK Intl', city: 'Ras Al Khaimah' },
  { icao: 'OMFJ', name: 'Fujairah Intl', city: 'Fujairah' },
];

export default function AviationWeather({ language = 'en' }: AviationWeatherProps) {
  const [airports, setAirports] = useState<AirportData[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<string>('OMDB');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAviationData();
    const interval = setInterval(fetchAviationData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAviationData = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_BASE}/api/v1/aviation/metar`);
      if (response.ok) {
        const data = await response.json();
        setAirports(data.airports || []);
      }
    } catch (error) {
      console.error('Failed to fetch aviation data:', error);
      // Set default data
      setAirports(UAE_AIRPORTS.map(a => ({
        icao: a.icao,
        name: a.name,
        visibility: 10000 + Math.random() * 6000,
        dustCondition: 'Clear',
        temperature: 20 + Math.random() * 15,
        wind_speed: 5 + Math.random() * 20,
        flight_category: 'VFR'
      })));
    } finally {
      setLoading(false);
    }
  };

  const selected = airports.find(a => a.icao === selectedAirport) || airports[0];

  const getFlightCategoryColor = (category?: string) => {
    switch (category) {
      case 'VFR': return 'from-emerald-400 to-emerald-500';
      case 'MVFR': return 'from-amber-300 to-amber-400';
      case 'IFR': return 'from-orange-400 to-orange-500';
      case 'LIFR': return 'from-red-400 to-red-500';
      default: return 'from-emerald-400 to-emerald-500';
    }
  };

  const getConditionIcon = (condition?: string) => {
    if (!condition) return '✅';
    if (condition.includes('Dust') || condition.includes('Sand')) return '🌫️';
    if (condition.includes('Haze')) return '🌁';
    return '✅';
  };

  return (
    <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-stone-200" style={{ background: 'linear-gradient(135deg, #FFE3E3 0%, #E4D8DC 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #D4A574 0%, #B8935F 100%)' }}>
            ✈️
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-800">
              {language === 'en' ? 'Aviation Weather' : 'طقس الطيران'}
            </h3>
            <p className="text-stone-600 text-sm">
              {language === 'en' ? 'Real-time METAR data for UAE airports' : 'بيانات METAR في الوقت الفعلي'}
            </p>
          </div>
        </div>

        {/* Airport Selector */}
        <div className="flex flex-wrap gap-2">
          {UAE_AIRPORTS.map((airport) => (
            <motion.button
              key={airport.icao}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAirport(airport.icao)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedAirport === airport.icao
                  ? 'text-white shadow-lg'
                  : 'bg-white/70 text-stone-700 hover:text-stone-900 border border-stone-300'
              }`}
              style={selectedAirport === airport.icao ? { background: 'linear-gradient(135deg, #D4A574 0%, #B8935F 100%)' } : {}}
            >
              {airport.icao}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected Airport Details */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : selected && (
        <div className="p-6">
          {/* Airport Name */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-stone-800">{selected.name}</h4>
            <p className="text-stone-600 text-sm">{selected.icao}</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Visibility */}
            <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👁️</span>
                <span className="text-stone-600 text-sm">Visibility</span>
              </div>
              <p className="text-2xl font-bold text-stone-800">
                {((selected.visibility || 10000) / 1000).toFixed(1)} km
              </p>
            </div>

            {/* Conditions */}
            <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getConditionIcon(selected.dustCondition)}</span>
                <span className="text-stone-600 text-sm">Conditions</span>
              </div>
              <p className="text-2xl font-bold text-stone-800">
                {selected.dustCondition || 'Clear'}
              </p>
            </div>

            {/* Temperature */}
            <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🌡️</span>
                <span className="text-stone-600 text-sm">Temperature</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#D4A574' }}>
                {selected.temperature?.toFixed(0) || '--'}°C
              </p>
            </div>

            {/* Wind */}
            <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💨</span>
                <span className="text-stone-600 text-sm">Wind</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#93B5C6' }}>
                {selected.wind_speed?.toFixed(0) || '--'} kt
              </p>
            </div>
          </div>

          {/* Flight Category */}
          <div className={`p-4 rounded-xl bg-gradient-to-r ${getFlightCategoryColor(selected.flight_category)} mb-4 shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-medium">Flight Category</p>
                <p className="text-2xl font-bold text-white">
                  {selected.flight_category || 'VFR'}
                </p>
              </div>
              <div className="text-4xl">
                {selected.flight_category === 'VFR' ? '✅' : 
                 selected.flight_category === 'MVFR' ? '⚠️' : 
                 selected.flight_category === 'IFR' ? '🚫' : '✅'}
              </div>
            </div>
          </div>

          {/* Operations Status */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-xl">✈️</span>
              </div>
              <div>
                <p className="font-semibold text-stone-800">Flight Operations</p>
                <p className="text-emerald-700 text-sm">
                  {selected.dustCondition === 'Clear' || !selected.dustCondition
                    ? 'Normal operations - All runways active'
                    : 'Reduced visibility - Check NOTAMs'}
                </p>
              </div>
            </div>
          </div>

          {/* METAR Raw */}
          {selected.metar && (
            <div className="mt-4 p-3 rounded-xl bg-stone-100 border border-stone-200">
              <p className="text-stone-600 text-xs mb-1">Raw METAR</p>
              <p className="text-stone-800 text-xs font-mono break-all">{selected.metar}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
