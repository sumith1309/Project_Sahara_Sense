"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface AnalyticsOverview {
  total_readings: number;
  avg_dust_24h: number;
  max_dust_24h: number;
  min_dust_24h: number;
  active_alerts: number;
  cities_monitored: number;
  last_updated: string;
}

const UAE_CITIES = [
  { id: 'dubai', name: 'Dubai', icon: '🏙️' },
  { id: 'abu_dhabi', name: 'Abu Dhabi', icon: '🕌' },
  { id: 'sharjah', name: 'Sharjah', icon: '🏛️' },
  { id: 'al_ain', name: 'Al Ain', icon: '🌴' },
  { id: 'ajman', name: 'Ajman', icon: '⛵' },
  { id: 'ras_al_khaimah', name: 'Ras Al Khaimah', icon: '🏔️' },
  { id: 'fujairah', name: 'Fujairah', icon: '🌊' },
  { id: 'umm_al_quwain', name: 'Umm Al Quwain', icon: '🐚' },
];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [selectedCity, setSelectedCity] = useState('dubai');
  const [cityAnalytics, setCityAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/analytics/overview`);
        const data = await res.json();
        setOverview(data);
      } catch (err) {
        console.error('Failed to fetch overview:', err);
      }
    };
    fetchOverview();
  }, []);

  useEffect(() => {
    const fetchCityAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/analytics/history/${selectedCity}?hours=168`);
        const data = await res.json();
        setCityAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch city analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCityAnalytics();
  }, [selectedCity]);

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/analytics/export/${selectedCity}?format=${format}&hours=168`);
      const data = await res.json();
      
      if (format === 'csv') {
        const blob = new Blob([data.csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sahara_sense_${selectedCity}_data.csv`;
        a.click();
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sahara_sense_${selectedCity}_data.json`;
        a.click();
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black flex items-center gap-2">
            <img src="/icons/logo.png" alt="Sahara Sense" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-amber-500">SAHARA</span>
            <span className="text-white"> SENSE</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
            <Link href="/predictions" className="text-gray-400 hover:text-white transition">Predictions</Link>
            <Link href="/analytics" className="text-orange-400 font-medium">Analytics</Link>
            <Link href="/alerts" className="text-gray-400 hover:text-white transition">Alerts</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">📊 Analytics Dashboard</h1>
          <p className="text-gray-400 mb-8">Historical data analysis and insights</p>
        </motion.div>

        {/* Overview Stats */}
        {overview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          >
            <div className="glass p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Total Readings (24h)</p>
              <p className="text-3xl font-bold text-white">{overview.total_readings}</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Avg Dust (24h)</p>
              <p className="text-3xl font-bold text-orange-400">{overview.avg_dust_24h?.toFixed(1)}</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Max Dust (24h)</p>
              <p className="text-3xl font-bold text-red-400">{overview.max_dust_24h?.toFixed(1)}</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Active Alerts</p>
              <p className="text-3xl font-bold text-yellow-400">{overview.active_alerts}</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Cities Monitored</p>
              <p className="text-3xl font-bold text-green-400">{overview.cities_monitored}</p>
            </div>
          </motion.div>
        )}

        {/* City Selector */}
        <div className="flex flex-wrap gap-3 mb-8">
          {UAE_CITIES.map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                selectedCity === city.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              <span>{city.icon}</span>
              <span>{city.name}</span>
            </button>
          ))}
        </div>

        {/* City Analytics */}
        {loading ? (
          <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
        ) : cityAnalytics ? (
          <motion.div
            key={selectedCity}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Statistics */}
            {cityAnalytics.statistics && (
              <div className="glass p-6 rounded-2xl">
                <h2 className="text-xl font-bold mb-4">7-Day Statistics: {cityAnalytics.city_name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Average Dust</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {cityAnalytics.statistics.avg_dust?.toFixed(1)} μg/m³
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Maximum</p>
                    <p className="text-2xl font-bold text-red-400">
                      {cityAnalytics.statistics.max_dust?.toFixed(1)} μg/m³
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Minimum</p>
                    <p className="text-2xl font-bold text-green-400">
                      {cityAnalytics.statistics.min_dust?.toFixed(1)} μg/m³
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Data Points</p>
                    <p className="text-2xl font-bold text-white">{cityAnalytics.data_points}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Distribution */}
            {cityAnalytics.risk_distribution && (
              <div className="glass p-6 rounded-2xl">
                <h2 className="text-xl font-bold mb-4">Risk Distribution</h2>
                <div className="flex gap-2 h-8">
                  {Object.entries(cityAnalytics.risk_distribution).map(([level, count]) => {
                    const total = Object.values(cityAnalytics.risk_distribution).reduce((a: number, b: any) => a + b, 0) as number;
                    const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                    const colors: Record<string, string> = {
                      low: 'bg-green-500',
                      moderate: 'bg-yellow-500',
                      high: 'bg-orange-500',
                      severe: 'bg-red-500',
                      extreme: 'bg-purple-500'
                    };
                    return (
                      <div
                        key={level}
                        className={`${colors[level]} rounded transition-all`}
                        style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '20px' : '0' }}
                        title={`${level}: ${count} readings (${percentage.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>🟢 Low</span>
                  <span>🟡 Moderate</span>
                  <span>🟠 High</span>
                  <span>🔴 Severe</span>
                  <span>🟣 Extreme</span>
                </div>
              </div>
            )}

            {/* Export Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => exportData('csv')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition"
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => exportData('json')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition"
              >
                📥 Export JSON
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            No analytics data available yet. Data will appear after collection starts.
          </div>
        )}
      </main>
    </div>
  );
}
