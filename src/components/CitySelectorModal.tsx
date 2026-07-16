'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle, ShieldCheck, Sparkles, X, Navigation } from 'lucide-react';
import { CityHub } from '@/types';
import { CITIES } from '@/data/mockData';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityHub | null;
  onSelectCity: (city: CityHub) => void;
}

export default function CitySelectorModal({
  isOpen,
  onClose,
  currentCity,
  onSelectCity,
}: CitySelectorModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <Navigation className="h-5 w-5 animate-pulse" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Select Municipal City Boundary
                </h3>
                <p className="text-xs text-slate-400">
                  Calculates across entire municipal limits (No district restriction).
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* City Grid */}
          <div className="mt-5 space-y-3">
            {CITIES.map((city) => {
              const isSelected = city.id === currentCity?.id;

              return (
                <button
                  key={city.id}
                  onClick={() => {
                    onSelectCity(city);
                    onClose();
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/15 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/70 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`h-12 w-12 rounded-2xl flex flex-col items-center justify-center font-extrabold text-xs border shrink-0 ${
                        isSelected
                          ? 'bg-cyan-500/25 border-cyan-500/50 text-cyan-300 shadow-inner'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-sm">{city.name.slice(0, 2).toUpperCase()}</span>
                      <span className="text-[9px] text-cyan-400 font-mono font-normal">
                        {city.municipalRadiusKm}km
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-white">{city.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
                          {city.state}
                        </span>
                      </div>
                      <p className="text-xs text-cyan-400 font-semibold mt-0.5 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" /> Full Municipal Limit: {city.municipalRadiusKm} km radius
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        Covers all roads: {city.hubs.join(', ')}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle className="h-6 w-6 text-cyan-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note explaining automatic 100m default & background sync */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Automatic 100m Proximity Default:</strong> Wherever your live GPS or simulated walk is inside {currentCity.name}, the radar defaults to exactly <strong className="text-white">100 meters</strong> around you.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Navigation className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Background Road Tracking:</strong> When app is minimized, Service Worker background sync updates your radar pin automatically as you walk down roads or coaching centers.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
