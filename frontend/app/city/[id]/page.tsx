"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { getCityProfile } from '@/lib/data/cityProfiles';
import { cityImages, cityLandmarks } from '@/lib/cityImages';
import {
  LocationIcon, HistoryIcon, EconomyIcon, LandmarkIcon, PopulationIcon,
  ClimateIcon, TransportIcon, CultureIcon, AchievementIcon, DustIcon,
  TemperatureIcon, WindIcon, HumidityIcon, VisibilityIcon, ArrowLeftIcon, LiveIndicator
} from '@/components/icons/Icons';

const CityLocationMap = dynamic(() => import('@/components/maps/CityLocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stone-100 animate-pulse flex items-center justify-center">
      <span className="text-stone-600">Loading map...</span>
    </div>
  )
});

interface WeatherData {
  city_id: string;
  city_name: string;
  dust: number;
  pm10: number;
  pm2_5: number;
  aqi: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  visibility: number;
  risk_level: string;
  confidence: number;
}

interface PredictionData {
  forecast_24h: Array<{ hour: number; time: string; dust: number; confidence: number; risk_level: string }>;
  summary: { peak_dust: number; peak_hour: number; min_dust: number; avg_dust: number };
}

type TabId = 'overview' | 'history' | 'economy' | 'landmarks' | 'achievements' | 'demographics' | 'climate' | 'transport' | 'culture';
type ViewMode = 'images' | 'map';

const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <LocationIcon size={18} /> },
  { id: 'history', label: 'History', icon: <HistoryIcon size={18} /> },
  { id: 'economy', label: 'Economy', icon: <EconomyIcon size={18} /> },
  { id: 'landmarks', label: 'Landmarks', icon: <LandmarkIcon size={18} /> },
  { id: 'achievements', label: 'Achievements', icon: <AchievementIcon size={18} /> },
  { id: 'demographics', label: 'Demographics', icon: <PopulationIcon size={18} /> },
  { id: 'climate', label: 'Climate', icon: <ClimateIcon size={18} /> },
  { id: 'transport', label: 'Transport', icon: <TransportIcon size={18} /> },
  { id: 'culture', label: 'Culture', icon: <CultureIcon size={18} /> },
];

export default function CityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('images');
  const [mounted, setMounted] = useState(false);

  const profile = getCityProfile(id);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  
  // Get city images
  const images = cityImages[id] || cityImages.dubai;
  const landmarks = cityLandmarks[id] || cityLandmarks.dubai;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Image slideshow effect
  useEffect(() => {
    if (viewMode !== 'images') return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length, viewMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentRes = await fetch(`${API_BASE}/api/v1/dust/current`);
        if (currentRes.ok) {
          const data = await currentRes.json();
          const cityData = data.cities?.find((c: WeatherData) => c.city_id === id);
          if (cityData) setWeather(cityData);
        }
        const predRes = await fetch(`${API_BASE}/api/v1/predictions/${id}`);
        if (predRes.ok) {
          const predData = await predRes.json();
          setPredictions(predData);
        }
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [id, API_BASE]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">City Not Found</h1>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const getRiskStyles = (level: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      LOW: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
      MODERATE: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
      SEVERE: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
      EXTREME: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
    };
    return styles[level] || styles.LOW;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5F5F4 0%, #FFE3E3 30%, #E4D8DC 70%, #C9CCD5 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/70 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 hover:text-stone-900 transition-colors">
                <ArrowLeftIcon size={20} />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-stone-800">{profile.name}</h1>
                  <span className="text-lg text-stone-600">{profile.arabicName}</span>
                </div>
                <p className="text-sm text-stone-600">{profile.overview.area} • Founded {profile.overview.founded}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LiveIndicator />
              <span className="text-sm text-stone-600" suppressHydrationWarning>{mounted ? lastUpdate.toLocaleTimeString() : '--:--:--'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        {/* Top Section: Images/Map and Live Data */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Left: Image Slideshow / Map Toggle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl overflow-hidden border border-stone-200 bg-white/80 backdrop-blur-sm relative shadow-lg"
            style={{ height: '500px' }}
          >
            {/* View Toggle Buttons */}
            <div className="absolute top-4 right-4 z-[1000] flex gap-2 flex-wrap pointer-events-auto">
              <button
                onClick={() => setViewMode('images')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-lg ${
                  viewMode === 'images'
                    ? 'text-white'
                    : 'bg-white/90 text-stone-700 hover:bg-white'
                }`}
                style={viewMode === 'images' ? { background: 'linear-gradient(135deg, #D4A574 0%, #B8935F 100%)' } : {}}
              >
                📷 Photos
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-lg ${
                  viewMode === 'map'
                    ? 'text-white'
                    : 'bg-white/90 text-stone-700 hover:bg-white'
                }`}
                style={viewMode === 'map' ? { background: 'linear-gradient(135deg, #D4A574 0%, #B8935F 100%)' } : {}}
              >
                🗺️ Map
              </button>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'images' && (
              <>
                {/* Image Slideshow */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </motion.div>
                </AnimatePresence>

                {/* Image Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h3 className="text-2xl font-bold text-white mb-1">{profile.name}</h3>
                      <p className="text-white/80">{landmarks[currentImageIndex]}</p>
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Progress Dots */}
                  <div className="flex gap-2 mt-4">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === currentImageIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
                >
                  →
                </button>
              </>
            )}

            {viewMode === 'map' && (
              <div className="relative w-full h-full">
                <CityLocationMap lat={profile.coordinates.lat} lon={profile.coordinates.lon} cityName={profile.name} weather={weather} />
              </div>
            )}
          </motion.div>

          {/* Right: Live Weather Data */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
            {/* Current Conditions Card */}
            <div className="p-6 rounded-2xl border border-stone-200 bg-white/80 backdrop-blur-sm shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-stone-800">Current Conditions</h2>
                {weather && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskStyles(weather.risk_level).bg} ${getRiskStyles(weather.risk_level).text} ${getRiskStyles(weather.risk_level).border} border`}>
                    {weather.risk_level} RISK
                  </span>
                )}
              </div>
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (<div key={i} className="h-20 rounded-xl bg-stone-200 animate-pulse" />))}
                </div>
              ) : weather ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
                    <div className="flex items-center gap-2 text-stone-600 mb-2"><DustIcon size={16} /><span className="text-sm">Dust Level</span></div>
                    <p className="text-2xl font-semibold text-stone-800">{weather.dust.toFixed(1)}<span className="text-sm text-stone-500 ml-1">μg/m³</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
                    <div className="flex items-center gap-2 text-stone-600 mb-2"><TemperatureIcon size={16} /><span className="text-sm">Temperature</span></div>
                    <p className="text-2xl font-semibold text-stone-800">{weather.temperature.toFixed(1)}<span className="text-sm text-stone-500 ml-1">°C</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
                    <div className="flex items-center gap-2 text-stone-600 mb-2"><HumidityIcon size={16} /><span className="text-sm">Humidity</span></div>
                    <p className="text-2xl font-semibold text-stone-800">{weather.humidity.toFixed(0)}<span className="text-sm text-stone-500 ml-1">%</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
                    <div className="flex items-center gap-2 text-stone-600 mb-2"><WindIcon size={16} /><span className="text-sm">Wind Speed</span></div>
                    <p className="text-2xl font-semibold text-stone-800">{weather.wind_speed.toFixed(1)}<span className="text-sm text-stone-500 ml-1">km/h</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
                    <div className="flex items-center gap-2 text-stone-600 mb-2"><VisibilityIcon size={16} /><span className="text-sm">Visibility</span></div>
                    <p className="text-2xl font-semibold text-stone-800">{(weather.visibility / 1000).toFixed(1)}<span className="text-sm text-stone-500 ml-1">km</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
                    <div className="flex items-center gap-2 text-stone-600 mb-2"><span className="text-sm">Air Quality</span></div>
                    <p className="text-2xl font-semibold text-stone-800">{weather.aqi}<span className="text-sm text-stone-500 ml-1">AQI</span></p>
                  </div>
                </div>
              ) : (<p className="text-stone-600">Unable to load weather data</p>)}
            </div>

            {/* 24-Hour Forecast */}
            {predictions && (
              <div className="p-6 rounded-2xl border border-stone-200 bg-white/80 backdrop-blur-sm shadow-lg flex-1">
                <h2 className="text-lg font-medium text-stone-800 mb-4">24-Hour Dust Forecast</h2>
                <div className="overflow-x-auto">
                  <div className="flex gap-2 min-w-max pb-2">
                    {predictions.forecast_24h.slice(0, 12).map((hour, i) => (
                      <div key={i} className={`flex-shrink-0 w-14 p-2 rounded-lg text-center ${i === 0 ? 'bg-blue-100 border border-blue-300' : 'bg-stone-100'}`}>
                        <p className="text-xs text-stone-600 mb-1">{new Date(hour.time).toLocaleTimeString([], { hour: '2-digit' })}</p>
                        <p className={`text-sm font-semibold ${getRiskStyles(hour.risk_level).text}`}>{hour.dust.toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-stone-200">
                  <div><p className="text-xs text-stone-600">Peak</p><p className="text-sm font-semibold text-orange-600">{predictions.summary.peak_dust.toFixed(1)}</p></div>
                  <div><p className="text-xs text-stone-600">Peak Hour</p><p className="text-sm font-semibold text-stone-800">+{predictions.summary.peak_hour}h</p></div>
                  <div><p className="text-xs text-stone-600">Minimum</p><p className="text-sm font-semibold text-emerald-600">{predictions.summary.min_dust.toFixed(1)}</p></div>
                  <div><p className="text-xs text-stone-600">Average</p><p className="text-sm font-semibold text-stone-800">{predictions.summary.avg_dust.toFixed(1)}</p></div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* City Information Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-stone-200 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="border-b border-stone-200 overflow-x-auto">
            <div className="flex min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-stone-800 bg-stone-100 border-b-2'
                      : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
                  }`}
                  style={activeTab === tab.id ? { borderBottomColor: '#D4A574' } : {}}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <p className="text-stone-700 leading-relaxed text-lg">{profile.overview.introduction}</p>
                    
                    {/* Live Weather Integration in Overview */}
                    {weather && (
                      <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                        <h3 className="text-lg font-semibold text-stone-800 mb-3">Current Conditions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs text-stone-600">Dust Level</p>
                            <p className="text-xl font-bold text-stone-800">{weather.dust.toFixed(1)} <span className="text-sm">μg/m³</span></p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-600">Temperature</p>
                            <p className="text-xl font-bold text-stone-800">{weather.temperature.toFixed(1)}°C</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-600">Risk Level</p>
                            <p className={`text-xl font-bold ${getRiskStyles(weather.risk_level).text}`}>{weather.risk_level}</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-600">AQI</p>
                            <p className="text-xl font-bold text-stone-800">{weather.aqi}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
                        <p className="text-xs text-stone-600 mb-1">Area</p>
                        <p className="text-lg font-semibold text-stone-800">{profile.overview.area}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
                        <p className="text-xs text-stone-600 mb-1">Founded</p>
                        <p className="text-lg font-semibold text-stone-800">{profile.overview.founded}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
                        <p className="text-xs text-stone-600 mb-1">Population</p>
                        <p className="text-lg font-semibold text-stone-800">{profile.demographics.population}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
                        <p className="text-xs text-stone-600 mb-1">Ruler</p>
                        <p className="text-sm font-semibold text-stone-800">{profile.overview.ruler}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-6">
                    <p className="text-stone-700 leading-relaxed">{profile.history.significance}</p>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-stone-300" />
                      <div className="space-y-6">
                        {profile.history.timeline.map((item, i) => (
                          <div key={i} className="relative pl-10">
                            <div className="absolute left-2.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#D4A574' }} />
                            <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200">
                              <p className="font-semibold text-stone-800">{item.year}</p>
                              <p className="text-stone-700">{item.event}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'economy' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200">
                      <p className="text-sm text-stone-600 mb-1">Estimated GDP</p>
                      <p className="text-3xl font-bold text-stone-800">{profile.economy.gdp}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-stone-800 mb-3">Main Economic Sectors</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.economy.mainSectors.map((sector, i) => (
                          <span key={i} className="px-4 py-2 rounded-full bg-stone-800 text-white text-sm">{sector}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-stone-800 mb-3">Key Economic Facts</h3>
                      <ul className="space-y-2">
                        {profile.economy.keyFacts.map((fact, i) => (
                          <li key={i} className="flex items-start gap-3 text-stone-700">
                            <span className="text-emerald-600 mt-1">✓</span>
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'landmarks' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {profile.landmarks.map((landmark, i) => (
                      <div key={i} className="p-5 rounded-xl bg-stone-100/70 border border-stone-200 hover:border-stone-300 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-stone-800">{landmark.name}</h3>
                          <span className="text-xs text-stone-600 bg-stone-200 px-2 py-1 rounded">{landmark.established}</span>
                        </div>
                        <p className="text-stone-700 text-sm">{landmark.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'achievements' && (
                  <div className="space-y-4">
                    {profile.achievements.map((achievement, i) => (
                      <div key={i} className="p-5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">🏆</span>
                          <div>
                            <h3 className="text-lg font-semibold text-stone-800">{achievement.title}</h3>
                            <span className="text-xs font-medium" style={{ color: '#D4A574' }}>{achievement.year}</span>
                          </div>
                        </div>
                        <p className="text-stone-700 ml-11">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'demographics' && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl bg-stone-100/70 border border-stone-200 text-center">
                      <PopulationIcon size={32} className="mx-auto mb-3 text-blue-600" />
                      <p className="text-2xl font-bold text-stone-800">{profile.demographics.population}</p>
                      <p className="text-sm text-stone-600">Population</p>
                    </div>
                    <div className="p-6 rounded-xl bg-stone-100/70 border border-stone-200 text-center">
                      <LocationIcon size={32} className="mx-auto mb-3 text-emerald-600" />
                      <p className="text-2xl font-bold text-stone-800">{profile.demographics.density}</p>
                      <p className="text-sm text-stone-600">Population Density</p>
                    </div>
                    <div className="p-6 rounded-xl bg-stone-100/70 border border-stone-200 text-center">
                      <CultureIcon size={32} className="mx-auto mb-3 text-purple-600" />
                      <p className="text-lg font-bold text-stone-800">{profile.demographics.nationalityMix}</p>
                      <p className="text-sm text-stone-600">Nationality Mix</p>
                    </div>
                  </div>
                )}

                {activeTab === 'climate' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-5 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
                        <TemperatureIcon size={24} className="text-orange-600 mb-2" />
                        <p className="text-sm text-stone-600">Average Temperature</p>
                        <p className="text-xl font-semibold text-stone-800">{profile.climate.averageTemp}</p>
                      </div>
                      <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                        <HumidityIcon size={24} className="text-blue-600 mb-2" />
                        <p className="text-sm text-stone-600">Humidity</p>
                        <p className="text-xl font-semibold text-stone-800">{profile.climate.humidity}</p>
                      </div>
                      <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200">
                        <span className="text-2xl">🌧️</span>
                        <p className="text-sm text-stone-600 mt-2">Annual Rainfall</p>
                        <p className="text-xl font-semibold text-stone-800">{profile.climate.rainfall}</p>
                      </div>
                      <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
                        <DustIcon size={24} className="mb-2 text-amber-600" />
                        <p className="text-sm text-stone-600">Dust Seasons</p>
                        <p className="text-lg font-semibold text-stone-800">{profile.climate.dustSeasons}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'transport' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-stone-800 mb-3 flex items-center gap-2">✈️ Airports</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.transportation.airports.map((airport, i) => (
                          <span key={i} className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">{airport}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-stone-800 mb-3 flex items-center gap-2">🚢 Ports</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.transportation.ports.map((port, i) => (
                          <span key={i} className="px-4 py-2 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700">{port}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-stone-800 mb-3 flex items-center gap-2">🚇 Public Transit</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.transportation.publicTransit.map((transit, i) => (
                          <span key={i} className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">{transit}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'culture' && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl bg-stone-100/70 border border-stone-200">
                      <h3 className="text-lg font-medium text-stone-800 mb-2">Heritage & Traditions</h3>
                      <p className="text-stone-700">{profile.culture.heritage}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-stone-800 mb-3">Major Festivals & Events</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.culture.festivals.map((festival, i) => (
                          <span key={i} className="px-4 py-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-700">{festival}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-5 rounded-xl bg-stone-100/70 border border-stone-200">
                      <h3 className="text-lg font-medium text-stone-800 mb-2">Local Cuisine</h3>
                      <p className="text-stone-700">{profile.culture.cuisine}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
