'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, MapPin, MessageSquare, Phone, Search, Clock, Heart, Star, CheckCircle } from 'lucide-react';
import { TiffinListing, FoodCategory, CityHub } from '@/types';

interface TiffinViewProps {
  tiffins: TiffinListing[];
  currentCity: CityHub;
  onOpenListModal: () => void;
}

export default function TiffinView({ tiffins, currentCity, onOpenListModal }: TiffinViewProps) {
  const [filterFood, setFilterFood] = useState<FoodCategory | 'All'>('All');
  const [filterHomeCooked, setFilterHomeCooked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTiffins = useMemo(() => {
    return tiffins.filter((t) => {
      if (t.cityId !== currentCity.id) return false;
      if (filterFood !== 'All' && t.category !== filterFood) return false;
      if (filterHomeCooked && !t.isHomeCooked) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.hub.toLowerCase().includes(q) || t.todaysMenu.toLowerCase().includes(q);
      }
      return true;
    });
  }, [tiffins, currentCity.id, filterFood, filterHomeCooked, searchQuery]);

  const recommendedTiffins = useMemo(() => filteredTiffins.filter(t => t.distanceMeter <= 2000), [filteredTiffins]);
  const otherTiffins = useMemo(() => filteredTiffins.filter(t => t.distanceMeter > 2000), [filteredTiffins]);

  return (
    <div className="space-y-5 pb-28 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Tiffin & Mess</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Across {currentCity.name.split(' (')[0]}</p>
        </div>
        <button onClick={onOpenListModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] text-xs font-bold hover:bg-[var(--accent-amber)]/20 transition-colors">
          <Sparkles className="h-3.5 w-3.5" /> Feature ₹500/mo
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 'Pure veg', 'Ghar ka khana', 'Chicken'..."
          className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)]/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors"
        />
      </div>

      {/* Filter chips */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5">
        {([
          { label: 'All', value: 'All' },
          { label: 'Pure Veg', value: 'Pure Veg' },
          { label: 'Veg + Non-Veg', value: 'Veg + Non-Veg' },
        ] as { label: string; value: FoodCategory | 'All' }[]).map((c) => (
          <button key={c.value} onClick={() => setFilterFood(c.value)}
            className={`chip ${filterFood === c.value ? 'chip-active' : ''}`}>
            {c.label}
          </button>
        ))}
        <button onClick={() => setFilterHomeCooked(!filterHomeCooked)}
          className={`chip ${filterHomeCooked ? 'chip-active' : ''}`}>
          <Heart className={`h-3.5 w-3.5 ${filterHomeCooked ? 'fill-current' : ''}`} />
          Home Cooked
        </button>
      </div>

      {/* Grouped Tiffin listings (< 2 km Recommended vs Other City Areas) */}
      <div className="space-y-6">
        {filteredTiffins.length > 0 ? (
          <>
            {recommendedTiffins.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pt-1">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                  <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                    ✨ Recommended Near You (&le; 2 km)
                  </h3>
                </div>
                <div className="space-y-3">
                  {recommendedTiffins.map((item) => (
                    <TiffinCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {otherTiffins.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                  <h3 className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                    <span>🏙️ Other Mess & Tiffin Services across {currentCity.name.split(' (')[0]} (&gt; 2 km)</span>
                  </h3>
                  <span className="text-xs text-[var(--text-tertiary)]">{otherTiffins.length} listings</span>
                </div>
                <div className="space-y-3">
                  {otherTiffins.map((item) => (
                    <TiffinCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 card">
            <p className="text-base font-semibold text-[var(--text-tertiary)]">No tiffin centers found</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{searchQuery ? `No results for "${searchQuery}"` : 'Try a different filter'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TiffinCard({ item }: { item: any }) {
  return (
    <div className="card overflow-hidden">
      {/* Image */}
      <div className="relative h-44 sm:h-52 bg-[var(--bg-elevated)]">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {item.isPrime && (
          <span className="absolute top-3 left-3 badge badge-prime"><Star className="h-3 w-3" /> Featured</span>
        )}
        <span className="absolute bottom-3 right-3 badge badge-blue"><MapPin className="h-3 w-3" /> {item.distanceMeter}m</span>
        <span className={`absolute bottom-3 left-3 badge ${item.category === 'Pure Veg' ? 'badge-green' : 'bg-amber-500/15 text-[var(--accent-amber)]'}`}>
          {item.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-[var(--text-primary)] truncate">{item.title}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {item.mealTimings}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-black text-[var(--text-primary)]">₹{item.singleThaliPrice}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">/thali</p>
          </div>
        </div>

        {/* Today's menu */}
        <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <p className="text-[11px] font-bold text-[var(--accent)] mb-1">Today&apos;s Menu</p>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{item.todaysMenu}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
          <span>Monthly: <strong className="text-[var(--text-primary)]">₹{item.monthlySubscriptionPrice.toLocaleString()}</strong></span>
          <span>Delivery ≤ {item.deliveryRadiusKm} km</span>
        </div>

        <div className="flex gap-2 pt-1">
          <a href={`https://wa.me/${item.whatsappNumber}?text=${encodeURIComponent(`Hi, I'd like to order from "${item.title}" on Stay&Dine!`)}`}
            target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[var(--accent-green)]/12 text-[var(--accent-green)] text-sm font-bold hover:bg-[var(--accent-green)]/20 transition-colors">
            <MessageSquare className="h-4 w-4" /> WhatsApp
          </a>
          <a href={`tel:${item.contactPhone}`}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-sm font-semibold hover:opacity-80 transition-colors border border-[var(--border-subtle)]">
            <Phone className="h-4 w-4" /> Call
          </a>
        </div>
      </div>
    </div>
  );
}
