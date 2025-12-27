"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AccuracyData {
  overall_accuracy: number;
  status: string;
  target: number;
  minimum: number;
  cities: Record<string, {
    accuracy: number;
    samples: number;
    trend: string;
    last_validated?: string;
  }>;
  cities_meeting_target: number;
  total_cities: number;
  validation_pending?: boolean;
  message?: string;
}

export default function AccuracyPage() {
  const [accuracy, setAccuracy] = useState<AccuracyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccuracy();
    const interval = setInterval(fetchAccuracy, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAccuracy = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_BASE}/api/v1/accuracy/overall`);
      if (response.ok) {
        const data = await response.json();
        setAccuracy(data);
      }
    } catch (error) {
      console.error('Failed to fetch accuracy:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'text-green-400 bg-green-500/20';
      case 'GOOD': return 'text-blue-400 bg-blue-500/20';
      case 'ACCEPTABLE': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-red-400 bg-red-500/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'DECLINING': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-stone-600" />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5F5F4 0%, #FFE3E3 30%, #E4D8DC 70%, #C9CCD5 100%)' }}>
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at top, #C9CCD5, transparent)' }} />
      </div>

      <header className="relative z-10 border-b border-stone-200/50 bg-white/70 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold flex items-center gap-2">
              <img src="/icons/logo.png" alt="Sahara Sense" className="w-8 h-8 rounded-lg object-contain" />
              <span style={{ color: '#D4A574' }}>SAHARA</span>
              <span className="text-stone-800">SENSE</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-stone-600 hover:text-stone-900">Dashboard</Link>
              <Link href="/accuracy" className="font-medium" style={{ color: '#D4A574' }}>Accuracy</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-stone-800 mb-2">Model Accuracy</h1>
        <p className="text-stone-600 mb-8">Real-time prediction accuracy tracking</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : accuracy ? (
          <div className="space-y-8">
            {/* Overall Accuracy */}
            <div className="bg-white/80 backdrop-blur-sm border border-stone-200 rounded-2xl p-8 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-stone-800">Overall System Accuracy</h2>
                <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(accuracy.status)}`}>
                  {accuracy.status === 'INITIALIZING' ? '🔄 Initializing' : accuracy.status}
                </span>
              </div>

              {accuracy.status === 'INITIALIZING' && (
                <div className="mb-6 p-4 bg-blue-100 border border-blue-200 rounded-xl">
                  <p className="text-blue-700 text-sm">
                    ℹ️ The system is collecting data for validation. Showing estimated accuracy based on the 5-model ensemble architecture.
                    Real accuracy metrics will appear after sufficient data collection.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-6xl font-bold" style={{ color: '#D4A574' }}>
                    {accuracy.overall_accuracy.toFixed(1)}%
                  </p>
                  <p className="text-stone-600 mt-2">
                    {accuracy.validation_pending ? 'Estimated Accuracy' : 'Validated Accuracy'}
                  </p>
                </div>

                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div className="bg-stone-100/80 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{accuracy.target}%</p>
                    <p className="text-stone-600 text-sm">Target</p>
                  </div>
                  <div className="bg-stone-100/80 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{accuracy.minimum}%</p>
                    <p className="text-stone-600 text-sm">Minimum</p>
                  </div>
                  <div className="bg-stone-100/80 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {accuracy.cities_meeting_target}/{accuracy.total_cities}
                    </p>
                    <p className="text-stone-600 text-sm">Cities at Target</p>
                  </div>
                </div>
              </div>

              {/* Accuracy Bar */}
              <div className="mt-8">
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-green-500 transition-all duration-1000"
                    style={{ width: `${accuracy.overall_accuracy}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span>0%</span>
                  <span className="text-yellow-400">Min: {accuracy.minimum}%</span>
                  <span className="text-green-400">Target: {accuracy.target}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Model Architecture Info */}
            <div className="bg-white/80 backdrop-blur-sm border border-stone-200 rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-stone-800 mb-4">🤖 Ultra-Accuracy 7-Model Ensemble</h2>
              <p className="text-stone-600 text-sm mb-4">
                Advanced prediction system with Kalman filtering, adaptive weight optimization, and real-time calibration.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { name: 'Pattern', weight: '22%', desc: 'Seasonal + Diurnal + Weekly', color: 'from-blue-100 to-blue-200' },
                  { name: 'Weather', weight: '20%', desc: 'Multi-variable correlations', color: 'from-cyan-100 to-cyan-200' },
                  { name: 'Persistence', weight: '15%', desc: 'Trend + Momentum', color: 'from-green-100 to-green-200' },
                  { name: 'Climatology', weight: '12%', desc: 'Historical averages', color: 'from-yellow-100 to-yellow-200' },
                  { name: 'API Forecast', weight: '10%', desc: 'External data', color: 'from-purple-100 to-purple-200' },
                  { name: 'Neural', weight: '12%', desc: 'Learned patterns', color: 'from-pink-100 to-pink-200' },
                  { name: 'Meta', weight: '9%', desc: 'Ensemble optimizer', color: 'from-orange-100 to-orange-200' },
                ].map((model) => (
                  <div key={model.name} className={`bg-gradient-to-br ${model.color} rounded-xl p-3 border border-stone-200`}>
                    <p className="font-semibold text-stone-800 text-sm">{model.name}</p>
                    <p className="text-xl font-bold" style={{ color: '#D4A574' }}>{model.weight}</p>
                    <p className="text-stone-600 text-[10px] mt-1 leading-tight">{model.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-emerald-100 border border-emerald-200 text-center">
                  <p className="text-emerald-600 font-bold">Kalman Filter</p>
                  <p className="text-xs text-stone-600">Noise reduction</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 border border-blue-200 text-center">
                  <p className="text-blue-600 font-bold">Adaptive Weights</p>
                  <p className="text-xs text-stone-600">Auto-optimization</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100 border border-purple-200 text-center">
                  <p className="text-purple-600 font-bold">Real-time Calibration</p>
                  <p className="text-xs text-stone-600">Bias correction</p>
                </div>
              </div>
            </div>

            {/* Per-City Accuracy */}
            {Object.keys(accuracy.cities).length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">City-Level Accuracy</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(accuracy.cities).map(([cityId, stats]) => (
                    <div key={cityId} className="bg-gray-700/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white capitalize">
                          {cityId.replace('_', ' ')}
                        </h3>
                        <span>{getTrendIcon(stats.trend)}</span>
                      </div>
                      <p className={`text-3xl font-bold ${stats.accuracy >= 95 ? 'text-green-400' :
                        stats.accuracy >= 85 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                        {stats.accuracy.toFixed(1)}%
                      </p>
                      <div className="mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${stats.accuracy >= 95 ? 'bg-green-500' :
                            stats.accuracy >= 85 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                          style={{ width: `${stats.accuracy}%` }}
                        />
                      </div>
                      <p className="text-gray-400 text-sm mt-2">
                        {stats.samples} samples • {stats.trend}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-100 border border-blue-200 rounded-xl p-6">
              <h3 className="text-blue-600 font-semibold mb-2">📊 How Accuracy is Calculated</h3>
              <p className="text-stone-700 text-sm">
                Our v6.0 Ultra-Accuracy system uses a 7-model ensemble with advanced techniques:
                <strong className="text-stone-800"> Kalman filtering</strong> for noise reduction,
                <strong className="text-stone-800"> adaptive weight optimization</strong> based on real-time performance,
                and <strong className="text-stone-800"> bias correction</strong> for each city.
                Accuracy is calculated using MAPE with a forgiving formula:
                <strong className="text-stone-800"> Accuracy = 100% - (MAPE × 0.8)</strong>.
                The system continuously learns from historical data and adjusts predictions accordingly.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-stone-600">
            <p className="text-xl mb-4">📊 Accuracy Tracking Active</p>
            <p>The system is collecting data. Accuracy metrics will appear shortly.</p>
          </div>
        )}
      </main>
    </div>
  );
}
