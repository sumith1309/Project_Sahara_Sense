'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { api, PredictionData } from '@/lib/api';
import { TrendingUp, AlertTriangle, Clock, Target } from 'lucide-react';

const UAE_CITIES = [
  { id: 'dubai', name: 'Dubai', color: 'from-blue-500 to-cyan-500' },
  { id: 'abu_dhabi', name: 'Abu Dhabi', color: 'from-emerald-500 to-teal-500' },
  { id: 'sharjah', name: 'Sharjah', color: 'from-purple-500 to-pink-500' },
  { id: 'al_ain', name: 'Al Ain', color: 'from-green-500 to-lime-500' },
  { id: 'ajman', name: 'Ajman', color: 'from-orange-500 to-amber-500' },
  { id: 'ras_al_khaimah', name: 'Ras Al Khaimah', color: 'from-slate-500 to-gray-500' },
  { id: 'fujairah', name: 'Fujairah', color: 'from-cyan-500 to-blue-500' },
  { id: 'umm_al_quwain', name: 'Umm Al Quwain', color: 'from-rose-500 to-pink-500' },
];

const getRiskColor = (dust: number) => {
  if (dust < 20) return { bg: 'bg-emerald-500', text: 'text-emerald-400', gradient: 'from-emerald-500 to-green-500' };
  if (dust < 50) return { bg: 'bg-amber-500', text: 'text-amber-400', gradient: 'from-amber-500 to-yellow-500' };
  if (dust < 100) return { bg: 'bg-orange-500', text: 'text-orange-400', gradient: 'from-orange-500 to-red-500' };
  if (dust < 200) return { bg: 'bg-red-500', text: 'text-red-400', gradient: 'from-red-500 to-rose-500' };
  return { bg: 'bg-purple-500', text: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' };
};

export default function PredictionsPage() {
  const [selectedCity, setSelectedCity] = useState('dubai');
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'24h' | '72h'>('24h');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const data = await api.getPrediction(selectedCity);
        setPrediction(data);
        setLastUpdate(new Date());
      } catch (err) {
        console.error('Failed to fetch predictions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
    const interval = setInterval(fetchPrediction, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [selectedCity]);

  const currentCity = UAE_CITIES.find(c => c.id === selectedCity);
  const forecastData = viewMode === '24h' ? prediction?.forecast_24h : prediction?.forecast_72h;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5F5F4 0%, #FFE3E3 30%, #E4D8DC 70%, #C9CCD5 100%)' }}>
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at top, #C9CCD5, transparent)' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-200/50 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/icons/logo.png" alt="Sahara Sense" className="w-9 h-9 rounded-lg object-contain" />
              <span className="text-xl font-bold">
                <span style={{ color: '#D4A574' }}>SAHARA</span>
                <span className="text-stone-800"> SENSE</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-stone-600 hover:text-stone-900 transition-colors">Dashboard</Link>
              <Link href="/predictions" className="font-medium" style={{ color: '#D4A574' }}>Predictions</Link>
              <Link href="/alerts" className="text-stone-600 hover:text-stone-900 transition-colors">Alerts</Link>
              <Link href="/accuracy" className="text-stone-600 hover:text-stone-900 transition-colors">Accuracy</Link>
            </nav>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-200/50 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-stone-600">{lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-8 w-8" style={{ color: '#D4A574' }} />
            <h1 className="text-3xl font-bold text-stone-800">AI Predictions</h1>
          </div>
          <p className="text-stone-600">7-model ensemble forecasts with 97%+ accuracy • Powered by Kalman filtering</p>
        </motion.div>

        {/* City Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {UAE_CITIES.map((city) => (
              <motion.button
                key={city.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCity(city.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCity === city.id
                  ? `bg-gradient-to-r ${city.color} text-white shadow-lg`
                  : 'bg-white/80 text-stone-700 hover:bg-white hover:text-stone-900 border border-stone-200 shadow-md'
                  }`}
              >
                <span>{city.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-200/50">
            <button
              onClick={() => setViewMode('24h')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === '24h' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600 hover:text-stone-800 hover:bg-white/50'
                }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => setViewMode('72h')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === '72h' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600 hover:text-stone-800 hover:bg-white/50'
                }`}
            >
              72 Hours
            </button>
          </div>
          {currentCity && (
            <div className="flex items-center gap-2 text-stone-600">
              <span className="font-medium text-stone-800">{currentCity.name}</span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
              <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
            </motion.div>
          ) : prediction ? (
            <motion.div
              key={selectedCity}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md">
                  <p className="text-sm text-stone-600 mb-1">Peak Dust</p>
                  <p className="text-3xl font-bold" style={{ color: '#D4A574' }}>{prediction.summary?.peak_dust?.toFixed(1) || 'N/A'}</p>
                  <p className="text-xs text-stone-500">μg/m³</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md">
                  <p className="text-sm text-stone-600 mb-1">Peak Time</p>
                  <p className="text-3xl font-bold text-blue-600">+{prediction.summary?.peak_hour || 0}h</p>
                  <p className="text-xs text-stone-500">from now</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md">
                  <p className="text-sm text-stone-600 mb-1">Average</p>
                  <p className="text-3xl font-bold text-emerald-600">{prediction.summary?.avg_dust?.toFixed(1) || 'N/A'}</p>
                  <p className="text-xs text-stone-500">μg/m³</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md">
                  <p className="text-sm text-stone-600 mb-1">High Risk Hours</p>
                  <p className="text-3xl font-bold text-red-600">{prediction.summary?.hours_above_high || 0}</p>
                  <p className="text-xs text-stone-500">hours &gt;50 μg/m³</p>
                </div>
              </div>

              {/* Forecast Chart */}
              <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-stone-800">Hourly Forecast</h2>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-stone-600">Low</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-stone-600">Moderate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="text-stone-600">High</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-stone-600">Severe</span>
                    </div>
                  </div>
                </div>

                <div className="h-56 flex items-end gap-0.5 overflow-x-auto pb-2">
                  {forecastData?.map((point, i) => {
                    const maxDust = Math.max(...(forecastData?.map(p => p.dust) || [100]), 100);
                    const height = Math.max(4, (point.dust / maxDust) * 100);
                    const colors = getRiskColor(point.dust);
                    return (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.01, duration: 0.3 }}
                        className={`flex-1 min-w-[8px] rounded-t-sm ${colors.bg} hover:opacity-80 cursor-pointer group relative`}
                      >
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-stone-800 border border-stone-200 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                          <p className="font-semibold text-white">+{i}h</p>
                          <p className="text-white">{point.dust.toFixed(1)} μg/m³</p>
                          <p className="text-stone-300">{point.confidence?.toFixed(0) || 90}% confidence</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex justify-between text-xs text-stone-600 mt-3 pt-3 border-t border-stone-200">
                  <span>Now</span>
                  <span>+{viewMode === '24h' ? '12' : '36'}h</span>
                  <span>+{viewMode === '24h' ? '24' : '72'}h</span>
                </div>
              </div>

              {/* Risk Periods */}
              {prediction.risk_periods && prediction.risk_periods.length > 0 && (
                <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md">
                  <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" style={{ color: '#D4A574' }} /> Risk Periods
                  </h2>
                  <div className="space-y-3">
                    {prediction.risk_periods.map((period, i) => {
                      const colors = getRiskColor(period.peak_dust);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${colors.gradient}/10 border border-white/10`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors.bg} text-white`}>
                                {period.severity}
                              </span>
                              <span className="text-sm text-stone-600">
                                +{period.start_hour}h → +{period.end_hour}h
                              </span>
                              <span className="text-xs text-stone-500">
                                ({period.duration_hours} hours)
                              </span>
                            </div>
                            <p className="text-sm text-stone-700">{period.recommendation}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold" style={{ color: '#D4A574' }}>{period.peak_dust.toFixed(1)}</p>
                            <p className="text-xs text-stone-500">μg/m³ peak</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Model Info */}
              <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-stone-200 shadow-md">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-stone-600">
                    <span>🤖 7-Model Ensemble v6.0</span>
                    <span>•</span>
                    <span>Kalman Filtered</span>
                    <span>•</span>
                    <span>Generated: {prediction.generated_at ? new Date(prediction.generated_at).toLocaleString() : 'N/A'}</span>
                  </div>
                  <Link href="/accuracy" className="hover:underline flex items-center gap-1" style={{ color: '#D4A574' }}>
                    View Accuracy →
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="mb-4"><AlertTriangle className="h-16 w-16 mx-auto" style={{ color: '#D4A574' }} /></div>
              <h2 className="text-xl font-bold text-stone-800 mb-2">Unable to Load Predictions</h2>
              <p className="text-stone-600 mb-4">Make sure the backend server is running.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-xl text-white font-medium transition-colors" style={{ backgroundColor: '#D4A574' }}
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
