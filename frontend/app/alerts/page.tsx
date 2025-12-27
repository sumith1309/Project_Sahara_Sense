'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Alert } from '@/lib/types';
import { api } from '@/lib/api';
import { AlertTriangle, AlertCircle, Zap, Bell, CheckCircle, Shield, MapPin, Clock } from 'lucide-react';

const severityConfig = {
  EXTREME: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500',
    text: 'text-purple-400',
    Icon: AlertCircle,
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  SEVERE: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    badge: 'bg-red-500',
    text: 'text-red-400',
    Icon: AlertTriangle,
    gradient: 'from-red-500/20 to-orange-500/20'
  },
  HIGH: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500',
    text: 'text-orange-400',
    Icon: Zap,
    gradient: 'from-orange-500/20 to-amber-500/20'
  },
  MODERATE: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500',
    text: 'text-amber-400',
    Icon: Bell,
    gradient: 'from-amber-500/20 to-yellow-500/20'
  }
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [filter, setFilter] = useState<'all' | 'EXTREME' | 'SEVERE' | 'HIGH'>('all');
  const [soundEnabled, setSoundEnabled] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await api.getAlerts();
      const newAlerts = data.alerts || [];

      // Play sound for new severe alerts
      if (soundEnabled && newAlerts.length > alerts.length) {
        const newSevere = newAlerts.filter(
          (a: Alert) => (a.level === 'EXTREME' || a.level === 'SEVERE') &&
            !alerts.find(old => old.id === a.id)
        );
        if (newSevere.length > 0) {
          // Browser notification
          if (Notification.permission === 'granted') {
            new Notification('Sahara Sense Alert', {
              body: `${newSevere[0].city_name}: ${newSevere[0].message}`,
              icon: '/logo.png'
            });
          }
        }
      }

      setAlerts(newAlerts);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [alerts, soundEnabled]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(a => a.level === filter);

  const alertCounts = {
    all: alerts.length,
    EXTREME: alerts.filter(a => a.level === 'EXTREME').length,
    SEVERE: alerts.filter(a => a.level === 'SEVERE').length,
    HIGH: alerts.filter(a => a.level === 'HIGH').length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5F5F4 0%, #FFE3E3 30%, #E4D8DC 70%, #C9CCD5 100%)' }}>
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at top, #C9CCD5, transparent)' }} />
        {alerts.some(a => a.level === 'EXTREME' || a.level === 'SEVERE') && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
        )}
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
              <Link href="/predictions" className="text-stone-600 hover:text-stone-900 transition-colors">Predictions</Link>
              <Link href="/alerts" className="font-medium flex items-center gap-2" style={{ color: '#D4A574' }}>
                Alerts
                {alerts.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    {alerts.length}
                  </span>
                )}
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-green-500/20 text-green-600' : 'bg-stone-200/50 text-stone-600'
                  }`}
                title={soundEnabled ? 'Notifications enabled' : 'Enable notifications'}
              >
                {soundEnabled ? <Bell className="h-5 w-5" /> : <Bell className="h-5 w-5 opacity-50" />}
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-200/50 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-stone-600">{lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8" style={{ color: '#D4A574' }} />
            <h1 className="text-3xl font-bold text-stone-800">Active Alerts</h1>
          </div>
          <p className="text-stone-600">Real-time dust storm warnings • Auto-refreshes every 15 seconds</p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'EXTREME', 'SEVERE', 'HIGH'] as const).map((level) => {
            const config = level === 'all' ? null : severityConfig[level];
            return (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === level
                    ? level === 'all'
                      ? 'bg-white text-stone-800 shadow-md border border-stone-200'
                      : `${config?.bg} bg-opacity-50 border ${config?.border} text-stone-800`
                    : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200 shadow-sm'
                  }`}
              >
                {config ? <config.Icon className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                <span>{level === 'all' ? 'All Alerts' : level}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs ${filter === level ? 'bg-white/50' : 'bg-stone-200/50'
                  }`}>
                  {alertCounts[level]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Alerts List */}
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-800 mb-2">All Clear!</h2>
              <p className="text-stone-600 max-w-md mx-auto">
                {filter === 'all'
                  ? 'No active alerts at this time. Conditions are safe across all Emirates.'
                  : `No ${filter} level alerts currently active.`}
              </p>
              <div className="mt-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 inline-flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <p className="text-emerald-600 text-sm">
                  System monitoring 8 cities • 9+ data sources • Updated every 15s
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert, index) => {
                const config = severityConfig[alert.level as keyof typeof severityConfig] || severityConfig.HIGH;
                const IconComponent = config.Icon;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    className="p-6 rounded-2xl border bg-white/80 backdrop-blur-sm border-stone-200 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <IconComponent className={`h-6 w-6 ${config.text}`} />
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${config.badge} text-white`}>
                            {alert.level}
                          </span>
                          <span className="text-stone-800 font-semibold">{alert.city_name}</span>
                          <span className="text-stone-500 text-sm">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-lg text-stone-800 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-sm text-stone-600">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {alert.city_name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(alert.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold" style={{ color: '#D4A574' }}>
                          {alert.dust_level.toFixed(0)}
                        </p>
                        <p className="text-sm text-stone-600">μg/m³</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-200">
                      <Link
                        href={`/city/${alert.city_id || alert.city_name.toLowerCase().replace(' ', '_')}`}
                        className="px-4 py-2 rounded-lg bg-stone-200/50 text-stone-800 text-sm font-medium hover:bg-stone-200 transition-colors"
                      >
                        View City Details
                      </Link>
                      <Link
                        href="/predictions"
                        className="px-4 py-2 rounded-lg bg-stone-100/50 text-stone-700 text-sm hover:bg-stone-100 transition-colors"
                      >
                        See Forecast
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Emergency Info */}
        {alerts.some(a => a.level === 'EXTREME' || a.level === 'SEVERE') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-2xl bg-red-50 border border-red-200"
          >
            <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Emergency Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-600 mb-2">Emergency Contacts:</p>
                <p className="text-stone-800">UAE Emergency: <span className="font-bold">999</span></p>
                <p className="text-stone-800">Ambulance: <span className="font-bold">998</span></p>
                <p className="text-stone-800">Police: <span className="font-bold">999</span></p>
              </div>
              <div>
                <p className="text-stone-600 mb-2">Safety Recommendations:</p>
                <ul className="text-stone-800 space-y-1">
                  <li>• Stay indoors with windows closed</li>
                  <li>• Use air purifiers if available</li>
                  <li>• Wear N95 mask if going outside</li>
                  <li>• Keep medications accessible</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
