"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { api, CityDustData } from '@/lib/api';
import CityCard from '@/components/dashboard/CityCard';
import { Thermometer, Droplets, Wind, Cloud, BarChart3, Satellite, Heart, Plane, AlertTriangle } from 'lucide-react';

// Dynamic imports for heavy components
const SatelliteView = dynamic(() => import('@/components/satellite/SatelliteView'), { ssr: false });
const HealthAdvisor = dynamic(() => import('@/components/health/HealthAdvisor'), { ssr: false });
const AviationWeather = dynamic(() => import('@/components/aviation/AviationWeather'), { ssr: false });

// Real-time Stats Widget
function LiveStatsWidget({ cities }: { cities: CityDustData[] }) {
  const avgTemp = cities.length > 0 ? cities.reduce((s, c) => s + (c.temperature || 0), 0) / cities.length : 0;
  const avgHumidity = cities.length > 0 ? cities.reduce((s, c) => s + (c.humidity || 0), 0) / cities.length : 0;
  const avgWind = cities.length > 0 ? cities.reduce((s, c) => s + (c.wind_speed || 0), 0) / cities.length : 0;
  const avgDust = cities.length > 0 ? cities.reduce((s, c) => s + (c.dust || 0), 0) / cities.length : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFE3E3' }}>
            <Thermometer className="h-6 w-6" style={{ color: '#D4A574' }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-800">{avgTemp.toFixed(1)}°C</p>
            <p className="text-xs text-stone-600">Avg Temperature</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C9CCD5' }}>
            <Droplets className="h-6 w-6" style={{ color: '#93B5C6' }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-800">{avgHumidity.toFixed(0)}%</p>
            <p className="text-xs text-stone-600">Avg Humidity</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E4D8DC' }}>
            <Wind className="h-6 w-6" style={{ color: '#D4A574' }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-800">{avgWind.toFixed(1)} km/h</p>
            <p className="text-xs text-stone-600">Avg Wind Speed</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFE3E3' }}>
            <Cloud className="h-6 w-6" style={{ color: '#D4A574' }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-800">{avgDust.toFixed(0)} μg/m³</p>
            <p className="text-xs text-stone-600">Avg Dust Level</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


export default function DashboardPage() {
  const [cities, setCities] = useState<CityDustData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'overview' | 'satellite' | 'health' | 'aviation'>('overview');
  const [updateCount, setUpdateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dataQuality, setDataQuality] = useState<string>('excellent');
  const [mounted, setMounted] = useState(false);
  
  // Suppress unused variable warning
  void updateCount;

  const fetchData = useCallback(async () => {
    try {
      const response = await api.getCurrentDust();
      setCities(response.cities || []);
      // Determine data quality from city data
      const avgConfidence = response.cities?.length > 0 
        ? response.cities.reduce((s, c) => s + (c.confidence || 0), 0) / response.cities.length 
        : 0;
      setDataQuality(avgConfidence >= 80 ? 'excellent' : avgConfidence >= 60 ? 'good' : 'fair');
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
      setError(null);
    } catch (err) {
      setError('Unable to connect to backend');
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Calculate stats
  const avgDust = cities.length > 0 ? cities.reduce((sum, c) => sum + (c.dust || 0), 0) / cities.length : 0;
  const maxDustCity = cities.length > 0 ? cities.reduce((max, c) => (c.dust || 0) > (max.dust || 0) ? c : max, cities[0]) : null;
  const riskCounts = {
    LOW: cities.filter(c => c.risk_level === 'LOW').length,
    MODERATE: cities.filter(c => c.risk_level === 'MODERATE').length,
    HIGH: cities.filter(c => c.risk_level === 'HIGH' || c.risk_level === 'SEVERE' || c.risk_level === 'EXTREME').length,
  };

  const viewModes = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'satellite', label: 'Satellite', icon: <Satellite className="h-4 w-4" /> },
    { id: 'health', label: 'Health', icon: <Heart className="h-4 w-4" /> },
    { id: 'aviation', label: 'Aviation', icon: <Plane className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5F5F4 0%, #FFE3E3 30%, #E4D8DC 70%, #C9CCD5 100%)' }}>
      {/* Subtle Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at top, #C9CCD5, transparent)' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-200/50 bg-white/70 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <img src="/icons/logo.png" alt="Sahara Sense" className="w-9 h-9 rounded-lg object-contain" />
              <div>
                <span className="text-lg font-bold">
                  <span style={{ color: '#D4A574' }}>SAHARA</span>
                  <span className="text-stone-700"> SENSE</span>
                </span>
              </div>
            </Link>

            {/* View Mode Tabs */}
            <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-stone-200/50">
              {viewModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as typeof viewMode)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode.id
                      ? 'bg-white text-stone-800 shadow-sm'
                      : 'text-stone-600 hover:text-stone-800 hover:bg-white/50'
                  }`}
                >
                  {mode.icon}
                  <span className="hidden lg:inline">{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-stone-600 font-mono text-xs" suppressHydrationWarning>{mounted ? lastUpdate.toLocaleTimeString() : '--:--:--'}</span>
              </div>
              <div className="px-2 py-1 rounded-md bg-stone-200/50 text-xs text-stone-600">
                Quality: <span className="text-green-600">{dataQuality}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-6 py-6">
        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-100/80 border border-red-300"
            >
              <p className="text-red-700 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {viewMode === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Top Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md">
                  <p className="text-xs text-stone-600 uppercase tracking-wide mb-1">UAE Average</p>
                  <p className="text-3xl font-bold text-stone-800">{avgDust.toFixed(0)}<span className="text-lg text-stone-500 ml-1">μg/m³</span></p>
                </div>
                <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md">
                  <p className="text-xs text-stone-600 uppercase tracking-wide mb-1">Highest</p>
                  <p className="text-3xl font-bold" style={{ color: '#D4A574' }}>
                    {maxDustCity?.dust?.toFixed(0) || 0}<span className="text-lg text-stone-500 ml-1">μg/m³</span>
                  </p>
                  <p className="text-xs text-stone-600">{maxDustCity?.city_name}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md">
                  <p className="text-xs text-stone-600 uppercase tracking-wide mb-1">Risk Distribution</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-sm font-medium">{riskCounts.LOW}</span>
                    <span className="px-2 py-0.5 rounded text-sm font-medium" style={{ backgroundColor: '#FFE3E3', color: '#D4A574' }}>{riskCounts.MODERATE}</span>
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-sm font-medium">{riskCounts.HIGH}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md">
                  <p className="text-xs text-stone-600 uppercase tracking-wide mb-1">Data Sources</p>
                  <p className="text-3xl font-bold text-stone-800">7+<span className="text-lg text-stone-500 ml-1">APIs</span></p>
                  <p className="text-xs text-stone-600">Real-time feeds</p>
                </div>
              </div>

              {/* Live Weather Stats */}
              <LiveStatsWidget cities={cities} />

              {/* City Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-stone-800">UAE Emirates - Live Conditions</h2>
                  <span className="text-xs text-stone-600">{cities.length} cities monitored</span>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cities.map((city, i) => (
                      <motion.div
                        key={city.city_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <CityCard city={city} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {viewMode === 'satellite' && (
            <motion.div
              key="satellite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SatelliteView />
            </motion.div>
          )}

          {viewMode === 'health' && (
            <motion.div
              key="health"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HealthAdvisor 
                dustLevel={avgDust} 
                aqi={cities.length > 0 ? Math.round(cities.reduce((s, c) => s + (c.aqi || 0), 0) / cities.length) : 0} 
              />
            </motion.div>
          )}

          {viewMode === 'aviation' && (
            <motion.div
              key="aviation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AviationWeather />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
