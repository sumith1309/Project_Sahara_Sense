"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Wind, Thermometer, Eye, AlertTriangle, ChevronDown, Menu, X } from "lucide-react";

const uaeCities = [
  { id: "dubai", name: "Dubai" },
  { id: "abu_dhabi", name: "Abu Dhabi" },
  { id: "sharjah", name: "Sharjah" },
  { id: "al_ain", name: "Al Ain" },
  { id: "ajman", name: "Ajman" },
  { id: "ras_al_khaimah", name: "Ras Al Khaimah" },
  { id: "fujairah", name: "Fujairah" },
  { id: "umm_al_quwain", name: "Umm Al Quwain" },
];

const HelixScene = dynamic(
  () => import("@/components/ui/helix-hero"),
  { 
    ssr: false, 
    loading: () => <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-amber-50 to-stone-50" /> 
  }
);

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  const toggleDropdown = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === name ? null : name);
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <section className="relative h-screen w-screen font-sans tracking-tight overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5F5F4 0%, #FFE3E3 30%, #E4D8DC 70%, #C9CCD5 100%)' }}>
      {mounted && (
        <div className="absolute inset-0 z-0">
          <HelixScene />
        </div>
      )}

      <nav className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-stone-200/50 shadow-lg">
            <Link href="/" className="flex items-center gap-3">
              <img src="/icons/logo.png" alt="Sahara Sense" className="w-10 h-10 rounded-xl object-contain" />
              <span className="hidden sm:flex text-xl font-semibold">
                <span className="text-amber-700">SAHARA</span>
                <span className="text-stone-700 ml-1">SENSE</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg">
                Dashboard
              </Link>
              <div className="relative">
                <button 
                  onClick={(e) => toggleDropdown(e, "cities")} 
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                >
                  Cities 
                  <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === "cities" ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === "cities" && (
                  <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-stone-200 shadow-xl rounded-xl w-48 z-50">
                    {uaeCities.map((city) => (
                      <Link 
                        key={city.id} 
                        href={`/city/${city.id}`} 
                        className="block px-3 py-2 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg"
                      >
                        {city.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/predictions" className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg">
                Predictions
              </Link>
              <Link href="/alerts" className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg">
                Alerts
              </Link>
              <Link href="/analytics" className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg">
                Analytics
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                style={{ background: 'linear-gradient(135deg, #D4A574 0%, #B8935F 100%)' }}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                Launch App 
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="lg:hidden p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5 text-stone-700" /> : <Menu className="h-5 w-5 text-stone-700" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="absolute bottom-8 left-4 sm:bottom-12 sm:left-8 lg:bottom-16 lg:left-12 z-20 max-w-xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-stone-300 text-stone-700 text-sm font-medium mb-6 shadow-md">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#D4A574' }} />
          Real-time UAE Sandstorm Intelligence
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-stone-800 mb-4 leading-tight">
          Predict Tomorrow&apos;s
          <br />
          <span className="font-semibold" style={{ color: '#D4A574' }}>Sandstorms Today</span>
        </h1>
        
        <p className="text-stone-600 text-base sm:text-lg mb-8 max-w-md">
          Advanced AI-powered sandstorm prediction system for the UAE. 
          Protect your health with 97%+ accuracy using our 7-model ensemble.
        </p>
        
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 backdrop-blur-sm border border-stone-200 shadow-md">
            <Wind className="h-5 w-5" style={{ color: '#D4A574' }} />
            <span className="text-stone-700 font-medium">8 Cities</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 backdrop-blur-sm border border-stone-200 shadow-md">
            <Thermometer className="h-5 w-5" style={{ color: '#D4A574' }} />
            <span className="text-stone-700 font-medium">Real-time</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 backdrop-blur-sm border border-stone-200 shadow-md">
            <Eye className="h-5 w-5" style={{ color: '#D4A574' }} />
            <span className="text-stone-700 font-medium">72-Hour</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 backdrop-blur-sm border border-stone-200 shadow-md">
            <AlertTriangle className="h-5 w-5" style={{ color: '#D4A574' }} />
            <span className="text-stone-700 font-medium">Alerts</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/dashboard" 
            style={{ background: 'linear-gradient(135deg, #D4A574 0%, #B8935F 100%)' }}
            className="inline-flex items-center gap-2 px-8 py-4 text-white font-medium rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
          >
            View Dashboard 
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link 
            href="/predictions" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/90 backdrop-blur-sm hover:bg-white text-stone-700 hover:text-stone-900 font-medium rounded-full border border-stone-300 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            See Predictions
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 right-4 sm:bottom-12 sm:right-8 lg:bottom-16 lg:right-12 z-20 hidden md:block">
        <div className="flex flex-col gap-3">
          <div className="px-5 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-stone-200 text-right shadow-lg">
            <p className="text-2xl font-bold" style={{ color: '#D4A574' }}>97%+</p>
            <p className="text-sm text-stone-600">Accuracy</p>
          </div>
          <div className="px-5 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-stone-200 text-right shadow-lg">
            <p className="text-2xl font-bold" style={{ color: '#D4A574' }}>7</p>
            <p className="text-sm text-stone-600">AI Models</p>
          </div>
          <div className="px-5 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-stone-200 text-right shadow-lg">
            <p className="text-2xl font-bold" style={{ color: '#D4A574' }}>9+</p>
            <p className="text-sm text-stone-600">Data Sources</p>
          </div>
        </div>
      </div>
    </section>
  );
}
