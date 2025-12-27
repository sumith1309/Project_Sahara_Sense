"use client";

import { useState, useEffect } from 'react';
import { CityDustData } from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cityImages, cityLandmarks } from '@/lib/cityImages';

interface CityCardProps {
  city: CityDustData;
}

const riskColors: Record<string, { text: string; badge: string; bar: string }> = {
  LOW: { text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200', bar: 'bg-emerald-500' },
  MODERATE: { text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200', bar: 'bg-amber-500' },
  HIGH: { text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200', bar: 'bg-orange-500' },
  SEVERE: { text: 'text-red-600', badge: 'bg-red-100 text-red-700 ring-1 ring-red-200', bar: 'bg-red-500' },
  EXTREME: { text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200', bar: 'bg-purple-500' }
};

const trendIcons: Record<string, { icon: string; color: string }> = {
  rising: { icon: '↑', color: 'text-red-600' },
  falling: { icon: '↓', color: 'text-emerald-600' },
  stable: { icon: '→', color: 'text-stone-500' }
};

export default function CityCard({ city }: CityCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const colors = riskColors[city.risk_level] || riskColors.LOW;
  const trend = trendIcons[city.trend] || trendIcons.stable;
  const dustPercent = Math.min((city.dust || 0) / 500 * 100, 100);
  
  const images = cityImages[city.city_id] || cityImages.dubai;
  const landmarks = cityLandmarks[city.city_id] || cityLandmarks.dubai;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <Link href={`/city/${city.city_id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-stone-200 hover:border-stone-300 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
      >
        {/* Image Header with Slideshow */}
        <div className="relative h-36 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
          
          {/* Live Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-stone-700 font-medium">LIVE</span>
          </div>

          {/* City Name & Landmark */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-xl font-bold text-stone-800 drop-shadow-sm">{city.city_name}</h3>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentImageIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-stone-600"
              >
                {landmarks[currentImageIndex % landmarks.length]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Image Progress Dots */}
          <div className="absolute bottom-3 right-3 flex gap-1">
            {images.slice(0, 6).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentImageIndex ? 'w-4' : 'w-1'
                }`}
                style={{ backgroundColor: i === currentImageIndex ? '#D4A574' : 'rgba(212, 165, 116, 0.4)' }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Dust Level with Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-end gap-2">
                <motion.span 
                  key={city.dust}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className={`text-3xl font-bold tabular-nums ${colors.text}`}
                >
                  {Math.round(city.dust || 0)}
                </motion.span>
                <span className="text-sm text-gray-500 mb-0.5">μg/m³</span>
                <span className={`text-sm ${trend.color}`}>{trend.icon}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${colors.badge}`}>
                {city.risk_level}
              </span>
            </div>
            <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dustPercent}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${colors.bar}`}
              />
            </div>
          </div>

          {/* Weather Stats */}
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="p-1.5 rounded-lg bg-stone-100/70">
              <p className="text-base font-semibold text-stone-800">{city.temperature?.toFixed(0) || '--'}°</p>
              <p className="text-[9px] text-stone-600 uppercase">Temp</p>
            </div>
            <div className="p-1.5 rounded-lg bg-stone-100/70">
              <p className="text-base font-semibold text-stone-800">{city.humidity?.toFixed(0) || '--'}%</p>
              <p className="text-[9px] text-stone-600 uppercase">Humid</p>
            </div>
            <div className="p-1.5 rounded-lg bg-stone-100/70">
              <p className="text-base font-semibold text-stone-800">{city.wind_speed?.toFixed(0) || '--'}</p>
              <p className="text-[9px] text-stone-600 uppercase">km/h</p>
            </div>
            <div className="p-1.5 rounded-lg bg-stone-100/70">
              <p className="text-base font-semibold text-stone-800">{city.aqi || '--'}</p>
              <p className="text-[9px] text-stone-600 uppercase">AQI</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
