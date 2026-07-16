'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, MapPin, MessageSquare, Phone, Search, CheckCircle, Star } from 'lucide-react';
import { PgListing, PgType, FlatListing, FlatCategory, BhkType, CityHub } from '@/types';

type SubTab = 'hostels' | 'flats';

interface StayViewProps {
  pgs: PgListing[];
  flats: FlatListing[];
  currentCity: CityHub;
  onOpenListModal: () => void;
}

export default function StayView({ pgs, flats, currentCity, onOpenListModal }: StayViewProps) {
  const [subTab, setSubTab] = useState<SubTab>('hostels');
  const [searchQuery, setSearchQuery] = useState('');

  // Hostel/PG filters
  const [pgFilter, setPgFilter] = useState<PgType | 'All'>('All');

  // Flat filters
  const [flatCategory, setFlatCategory] = useState<FlatCategory | 'Co-Living' | 'All'>('All');
  const [flatBhk, setFlatBhk] = useState<BhkType | 'All'>('All');

  const filteredPgs = useMemo(() => {
    return pgs.filter((pg) => {
      if (pg.cityId !== currentCity.id) return false;
      if (pgFilter !== 'All' && pg.type !== pgFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return pg.title.toLowerCase().includes(q) || pg.hub.toLowerCase().includes(q) || pg.amenities.some((a) => a.toLowerCase().includes(q));
      }
      return true;
    });
  }, [pgs, currentCity.id, pgFilter, searchQuery]);

  const filteredFlats = useMemo(() => {
    return flats.filter((flat) => {
      if (flat.cityId !== currentCity.id) return false;
      if (flatBhk !== 'All' && flat.bhk !== flatBhk) return false;
      if (flatCategory !== 'All' && flatCategory !== 'Co-Living' && flat.category !== flatCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return flat.title.toLowerCase().includes(q) || flat.hub.toLowerCase().includes(q) || flat.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [flats, currentCity.id, flatBhk, flatCategory, searchQuery]);

  const pgFilterChips: { label: string; value: PgType | 'All' }[] = [
    { label: 'All', value: 'All' },
    { label: 'Only Boys', value: 'Only Boys' },
    { label: 'Only Girls', value: 'Only Girls' },
    { label: 'Co-ed', value: 'Co-ed' },
  ];

  const flatCategoryChips: { label: string; value: FlatCategory | 'Co-Living' | 'All' }[] = [
    { label: 'All', value: 'All' },
    { label: 'Independent', value: 'Independent' },
    { label: 'Bachelor', value: 'Bachelor Allowed' },
    { label: 'Family', value: 'Family Only' },
    { label: 'Co-Living', value: 'Co-Living' },
  ];

  const flatBhkChips: { label: string; value: BhkType | 'All' }[] = [
    { label: 'Any Size', value: 'All' },
    { label: '1 BHK', value: '1 BHK' },
    { label: '2 BHK', value: '2 BHK' },
    { label: '3 BHK', value: '3 BHK' },
  ];

  const recommendedPgs = useMemo(() => filteredPgs.filter(p => p.distanceMeter <= 2000), [filteredPgs]);
  const otherPgs = useMemo(() => filteredPgs.filter(p => p.distanceMeter > 2000), [filteredPgs]);

  const recommendedFlats = useMemo(() => filteredFlats.filter(f => f.distanceMeter <= 2000), [filteredFlats]);
  const otherFlats = useMemo(() => filteredFlats.filter(f => f.distanceMeter > 2000), [filteredFlats]);

  return (
    <div className="space-y-5 pb-28 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {subTab === 'hostels' ? 'Hostels & PGs' : 'Flats & Rooms'}
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Across {currentCity.name.split(' (')[0]}
          </p>
        </div>
        <button onClick={onOpenListModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] text-xs font-bold hover:bg-[var(--accent-amber)]/20 transition-colors">
          <Sparkles className="h-3.5 w-3.5" /> Feature ₹500/mo
        </button>
      </div>

      {/* Segment: Hostels/PGs  |  Flats */}
      <div className="segment-bar">
        <button onClick={() => { setSubTab('hostels'); setSearchQuery(''); }}
          className={`segment-btn ${subTab === 'hostels' ? 'segment-btn-active' : ''}`}>
          Hostels / PGs
        </button>
        <button onClick={() => { setSubTab('flats'); setSearchQuery(''); }}
          className={`segment-btn ${subTab === 'flats' ? 'segment-btn-active' : ''}`}>
          Flats & Rooms
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
        <input
          type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={subTab === 'hostels' ? "Search 'Lalpur hostel', 'AC PG'..." : "Search '2BHK Boring Road', 'Studio'..."}
          className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)]/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            ✕
          </button>
        )}
      </div>

      {/* Filter Chips */}
      {subTab === 'hostels' ? (
        <div className="flex overflow-x-auto no-scrollbar gap-1.5">
          {pgFilterChips.map((c) => (
            <button key={c.value} onClick={() => setPgFilter(c.value)}
              className={`chip ${pgFilter === c.value ? 'chip-active' : ''}`}>
              {c.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex overflow-x-auto no-scrollbar gap-1.5">
            {flatCategoryChips.map((c) => (
              <button key={c.value} onClick={() => setFlatCategory(c.value)}
                className={`chip ${flatCategory === c.value ? 'chip-active' : ''}`}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-1.5">
            {flatBhkChips.map((c) => (
              <button key={c.value} onClick={() => setFlatBhk(c.value)}
                className={`chip ${flatBhk === c.value ? 'chip-active' : ''}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grouped Listings (< 2 km Recommended vs Other City Areas) */}
      <div className="space-y-6">
        {subTab === 'hostels' ? (
          filteredPgs.length > 0 ? (
            <>
              {recommendedPgs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pt-1">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                      ✨ Recommended Near You (&le; 2 km)
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {recommendedPgs.map((pg) => (
                      <ListingCard key={pg.id} image={pg.image} title={pg.title} isPrime={pg.isPrime}
                        subtitle={`${pg.type} · ${pg.sharing} Sharing · ${pg.hub}`}
                        price={pg.rentPerMonth} priceLabel="/month"
                        tags={[pg.curfewTime !== 'No Curfew for Working' ? `Curfew ${pg.curfewTime}` : 'No Curfew',
                          pg.foodIncluded ? '3 Meals' : 'No Food',
                          ...pg.amenities.slice(0, 2)]}
                        distance={pg.distanceMeter} cityName={currentCity.name.split(' (')[0]}
                        whatsappNumber={pg.whatsappNumber} contactPhone={pg.contactPhone} whatsappText={`Hi, interested in "${pg.title}" listed on Stay&Dine. Is a bed available?`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {otherPgs.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                      <span>🏙️ Other Hostels & PGs across {currentCity.name.split(' (')[0]} (&gt; 2 km)</span>
                    </h3>
                    <span className="text-xs text-[var(--text-tertiary)]">{otherPgs.length} listings</span>
                  </div>
                  <div className="space-y-3">
                    {otherPgs.map((pg) => (
                      <ListingCard key={pg.id} image={pg.image} title={pg.title} isPrime={pg.isPrime}
                        subtitle={`${pg.type} · ${pg.sharing} Sharing · ${pg.hub}`}
                        price={pg.rentPerMonth} priceLabel="/month"
                        tags={[pg.curfewTime !== 'No Curfew for Working' ? `Curfew ${pg.curfewTime}` : 'No Curfew',
                          pg.foodIncluded ? '3 Meals' : 'No Food',
                          ...pg.amenities.slice(0, 2)]}
                        distance={pg.distanceMeter} cityName={currentCity.name.split(' (')[0]}
                        whatsappNumber={pg.whatsappNumber} contactPhone={pg.contactPhone} whatsappText={`Hi, interested in "${pg.title}" listed on Stay&Dine. Is a bed available?`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : <EmptyState text="No hostels/PGs found" subtext={searchQuery ? `No results for "${searchQuery}"` : 'Try a different filter'} />
        ) : (
          filteredFlats.length > 0 ? (
            <>
              {recommendedFlats.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pt-1">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                      ✨ Recommended Near You (&le; 2 km)
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {recommendedFlats.map((flat) => (
                      <ListingCard key={flat.id} image={flat.image} title={flat.title} isPrime={flat.isPrime}
                        subtitle={`${flat.bhk} · ${flat.category} · ${flat.hub}`}
                        price={flat.rentPerMonth} priceLabel="/month"
                        tags={[flat.furnishing, !flat.brokerage ? 'No Brokerage' : 'Brokerage', `Deposit ₹${(flat.securityDeposit / 1000).toFixed(0)}k`]}
                        distance={flat.distanceMeter} cityName={currentCity.name.split(' (')[0]}
                        whatsappNumber={flat.whatsappNumber} contactPhone={flat.contactPhone} whatsappText={`Hi, interested in "${flat.title}" listed on Stay&Dine. When is the earliest move-in?`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {otherFlats.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                      <span>🏙️ Other Flats & Rooms across {currentCity.name.split(' (')[0]} (&gt; 2 km)</span>
                    </h3>
                    <span className="text-xs text-[var(--text-tertiary)]">{otherFlats.length} listings</span>
                  </div>
                  <div className="space-y-3">
                    {otherFlats.map((flat) => (
                      <ListingCard key={flat.id} image={flat.image} title={flat.title} isPrime={flat.isPrime}
                        subtitle={`${flat.bhk} · ${flat.category} · ${flat.hub}`}
                        price={flat.rentPerMonth} priceLabel="/month"
                        tags={[flat.furnishing, !flat.brokerage ? 'No Brokerage' : 'Brokerage', `Deposit ₹${(flat.securityDeposit / 1000).toFixed(0)}k`]}
                        distance={flat.distanceMeter} cityName={currentCity.name.split(' (')[0]}
                        whatsappNumber={flat.whatsappNumber} contactPhone={flat.contactPhone} whatsappText={`Hi, interested in "${flat.title}" listed on Stay&Dine. When is the earliest move-in?`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : <EmptyState text="No flats found" subtext={searchQuery ? `No results for "${searchQuery}"` : 'Try a different filter'} />
        )}
      </div>
    </div>
  );
}

/* ── Reusable Listing Card ───────────────────────────────── */
function ListingCard({ image, title, isPrime, subtitle, price, priceLabel, tags, distance, whatsappNumber, contactPhone, whatsappText, cityName }: {
  image: string; title: string; isPrime: boolean; subtitle: string;
  price: number; priceLabel: string; tags: string[]; distance: number;
  whatsappNumber: string; contactPhone: string; whatsappText: string; cityName: string;
}) {
  return (
    <div className="card overflow-hidden">
      {/* Image */}
      <div className="relative h-44 sm:h-52 w-full bg-[var(--bg-elevated)]">
        <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {isPrime && (
          <span className="absolute top-3 left-3 badge badge-prime">
            <Star className="h-3 w-3" /> Featured
          </span>
        )}
        <span className="absolute bottom-3 right-3 badge badge-blue">
          <MapPin className="h-3 w-3" /> {distance}m
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-[var(--text-primary)] truncate">{title}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-black text-[var(--text-primary)]">₹{price.toLocaleString()}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">{priceLabel}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] text-[11px] font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              <CheckCircle className="h-3 w-3 text-[var(--accent-green)]" /> {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`}
            target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[var(--accent-green)]/12 text-[var(--accent-green)] text-sm font-bold hover:bg-[var(--accent-green)]/20 transition-colors">
            <MessageSquare className="h-4 w-4" /> WhatsApp
          </a>
          <a href={`tel:${contactPhone}`}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-sm font-semibold hover:opacity-80 transition-colors border border-[var(--border-subtle)]">
            <Phone className="h-4 w-4" /> Call
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────── */
function EmptyState({ text, subtext }: { text: string; subtext: string }) {
  return (
    <div className="text-center py-16 card">
      <p className="text-base font-semibold text-[var(--text-tertiary)]">{text}</p>
      <p className="text-xs text-[var(--text-secondary)] mt-1">{subtext}</p>
    </div>
  );
}
