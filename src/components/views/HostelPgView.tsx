'use client';

import React, { useState, useMemo } from 'react';
import { Building2, Sparkles, MapPin, CheckCircle, MessageSquare, Phone, Search, Navigation, Filter } from 'lucide-react';
import { PgListing, PgType, CityHub } from '@/types';

interface HostelPgViewProps {
  pgs: PgListing[];
  currentCity: CityHub;
  onOpenListModal: () => void;
}

export default function HostelPgView({
  pgs,
  currentCity,
  onOpenListModal,
}: HostelPgViewProps) {
  const [filterType, setFilterType] = useState<PgType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyRecommended2Km, setOnlyRecommended2Km] = useState<boolean>(false);

  const filteredPgs = useMemo(() => {
    return pgs.filter((pg) => {
      // Show ALL listings for the whole city (e.g. whole Ranchi / whole Patna / whole Delhi)
      if (pg.cityId !== currentCity.id) return false;

      // Type filter
      if (filterType !== 'All' && pg.type !== filterType) return false;

      // Recommended nearest within 2 km (2000 meters)
      if (onlyRecommended2Km && pg.distanceMeter > 2000) return false;

      // Keyword search (matches title, hub, amenities, or type like "Lalpur hostel / pg")
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchTitle = pg.title.toLowerCase().includes(query);
        const matchHub = pg.hub.toLowerCase().includes(query);
        const matchType = pg.type.toLowerCase().includes(query);
        const matchAmenities = pg.amenities.some((a) => a.toLowerCase().includes(query));
        if (!matchTitle && !matchHub && !matchType && !matchAmenities) return false;
      }

      return true;
    });
  }, [pgs, currentCity.id, filterType, onlyRecommended2Km, searchQuery]);

  const typeChips: { label: string; value: PgType | 'All' }[] = [
    { label: 'All Hostels & PGs', value: 'All' },
    { label: 'Only Boys 👨', value: 'Only Boys' },
    { label: 'Only Girls 👩', value: 'Only Girls' },
    { label: 'Co-ed / IT Pros 🧑', value: 'Co-ed' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-28">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
            <Building2 className="h-3.5 w-3.5" />
            <span>Whole City Verified Directory</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
            Hostels & PGs across {currentCity.name}
          </h2>
          <p className="text-[11px] sm:text-sm text-slate-400 mt-0.5">
            Showing all accommodations across city limits. Search exact hubs below.
          </p>
        </div>

        <button
          onClick={onOpenListModal}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 shrink-0 active:scale-95"
        >
          <Sparkles className="h-4 w-4 animate-spin" style={{ animationDuration: '6s' }} />
          <span>⚡ Feature Your PG (₹500/mo)</span>
        </button>
      </div>

      {/* Keyword Search Bar & Recommended 2km Toggle */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search keyword in ${currentCity.name} (e.g., 'Lalpur hostel', 'AC PG', 'Boring Road')...`}
            className="w-full bg-slate-900/95 border-2 border-slate-800 focus:border-cyan-400 text-white rounded-2xl pl-12 pr-4 py-3 text-xs sm:text-sm font-semibold placeholder-slate-500 shadow-inner focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Swipable Type Chips */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 py-1 -mx-1 px-1 touch-pan-x">
            {typeChips.map((chip) => {
              const isActive = filterType === chip.value;
              return (
                <button
                  key={chip.value}
                  onClick={() => setFilterType(chip.value)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 scale-105'
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Recommended Nearest within 2 km Switch */}
          <button
            onClick={() => setOnlyRecommended2Km(!onlyRecommended2Km)}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all active:scale-95 shrink-0 ${
              onlyRecommended2Km
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-inner font-extrabold ring-1 ring-emerald-400/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Navigation className={`h-4 w-4 ${onlyRecommended2Km ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span>🔥 Recommended (Nearest ≤ 2 km)</span>
          </button>
        </div>
      </div>

      {/* PG Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredPgs.map((pg) => (
          <div
            key={pg.id}
            className="glass-card rounded-3xl overflow-hidden border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-xl group active:scale-[0.99]"
          >
            <div>
              <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-slate-950">
                <img
                  src={pg.image}
                  alt={pg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {pg.isPrime && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-lg border border-amber-300/40">
                    <Sparkles className="h-3 w-3" /> ⭐ Verified Prime #1
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-xs font-bold border border-slate-800 text-cyan-400">
                    {pg.type} ({pg.sharing} Sharing) • {pg.hub}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-xs font-semibold border border-slate-800 flex items-center gap-1 text-slate-200">
                    <MapPin className="h-3 w-3 text-cyan-400" /> {pg.distanceMeter}m away
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors">
                      {pg.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                      Hub: <strong className="text-cyan-400">{pg.hub}</strong> • Curfew: <strong className="text-slate-200">{pg.curfewTime}</strong>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base sm:text-xl font-black text-amber-400">
                      ₹{pg.rentPerMonth.toLocaleString()}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">
                      Per Month
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pg.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 text-[10px] sm:text-[11px] font-medium flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3 text-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-2 sm:gap-3">
              <a
                href={`https://wa.me/${pg.whatsappNumber}?text=Hi, I saw your Verified Prime listing "${pg.title}" (${pg.hub}) across ${currentCity.name} on Stay&Dine Radar India. What is the current bed availability?`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp Owner</span>
              </a>

              <a
                href={`tel:${pg.contactPhone}`}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 border border-slate-700 active:scale-95"
              >
                <Phone className="h-4 w-4 text-cyan-400" />
                <span>Call</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredPgs.length === 0 && (
        <div className="text-center py-12 glass-card rounded-3xl border border-slate-800 max-w-md mx-auto p-6">
          <Building2 className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <h4 className="font-bold text-base text-white">No PGs found for &quot;{searchQuery || filterType}&quot;</h4>
          <p className="text-xs text-slate-400 mt-1">
            Try searching a broader keyword like <strong className="text-cyan-400">&quot;Boring Road&quot;</strong> or <strong className="text-cyan-400">&quot;Lalpur&quot;</strong>, or turn off the 2 km recommended filter.
          </p>
        </div>
      )}
    </div>
  );
}
