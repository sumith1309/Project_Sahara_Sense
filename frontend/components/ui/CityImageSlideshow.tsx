"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cityImages, cityLandmarks } from '@/lib/cityImages';

interface CityImageSlideshowProps {
  cityId: string;
  className?: string;
  showLandmark?: boolean;
  interval?: number;
  overlay?: 'light' | 'dark' | 'gradient' | 'none';
  children?: React.ReactNode;
}

export default function CityImageSlideshow({
  cityId,
  className = '',
  showLandmark = true,
  interval = 5000,
  overlay = 'gradient',
  children
}: CityImageSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const images = cityImages[cityId] || cityImages.dubai;
  const landmarks = cityLandmarks[cityId] || cityLandmarks.dubai;

  useEffect(() => {
    // Preload images
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    setIsLoaded(true);
  }, [images]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  const overlayStyles = {
    light: 'bg-white/20',
    dark: 'bg-black/50',
    gradient: 'bg-gradient-to-t from-black/80 via-black/20 to-black/30',
    none: ''
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Image Slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${images[currentIndex]})`,
              filter: isLoaded ? 'none' : 'blur(10px)'
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      {overlay !== 'none' && (
        <div className={`absolute inset-0 ${overlayStyles[overlay]}`} />
      )}

      {/* Landmark indicator */}
      {showLandmark && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-white/80 text-sm font-medium"
            >
              {landmarks[currentIndex % landmarks.length]}
            </motion.p>
          </AnimatePresence>
          
          {/* Progress dots */}
          <div className="flex gap-1.5 mt-2">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Children content */}
      {children && (
        <div className="relative z-10 h-full">
          {children}
        </div>
      )}
    </div>
  );
}
