'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { ShieldAlert, RefreshCw, Eye, EyeOff, UserPlus, Check, ChevronRight, MessageCircle, X, Users, Sparkles, Flame, MapPin, Search, Filter, ChevronDown, ChevronUp, AlertTriangle, Navigation } from 'lucide-react';
import { RadarPerson, CityHub } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface RadarViewProps {
  people: RadarPerson[];
  currentCity: CityHub;
  onOpenChatWithPerson: (person: RadarPerson) => void;
  onSendFriendRequest: (personId: string) => void;
  friendRequestsSent: string[];
}

// Generate 200+ simulated users for the Indian Campus Radar Demo
function generate200PlusPeers(basePeers: RadarPerson[], cityId: string): RadarPerson[] {
  const hubs = ['Boring Road', 'Lalpur Hub', 'Kankarbagh', 'Rajendra Nagar', 'Patliputra Colony'];
  const prepTags = ['BPSC Aspirant', 'UPSC Mains Prep', 'NEET Dropper Batch', 'CA Foundation', 'Software Eng / Coding', 'MBA / CAT Prep', 'Law / CLAT Aspirant'];
  const firstNames = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Aditya', 'Sneha', 'Vikram', 'Divya', 'Karan', 'Pooja', 'Rahul', 'Simran', 'Amit', 'Neha', 'Siddharth', 'Tanvi', 'Deepak', 'Meers', 'Arjun', 'Isha'];
  const lastNames = ['Kumar', 'Singh', 'Sharma', 'Verma', 'Gupta', 'Mishra', 'Choudhary', 'Ranjan', 'Yadav', 'Jha'];
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  ];

  const simulated: RadarPerson[] = [...basePeers.filter(p => p.cityId === cityId)];
  const needed = Math.max(0, 214 - simulated.length);

  for (let i = 0; i < needed; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3 + 7) % lastNames.length];
    const hub = hubs[i % hubs.length];
    const bio = `${prepTags[i % prepTags.length]} · Looking for study partners & PG discussions around ${hub}.`;
    const gender = i % 3 === 0 ? 'Girls' : i % 3 === 1 ? 'Boys' : 'Others';
    const dist = 25 + ((i * 37 + 13) % 920);

    simulated.push({
      id: `sim-user-${i}`,
      name: `${fn} ${ln}`,
      avatar: avatars[i % avatars.length],
      coordinates: { lat: 23.364 + (Math.random() - 0.5) * 0.02, lng: 85.319 + (Math.random() - 0.5) * 0.02 },
      distanceMeter: dist,
      status: i % 4 === 0 ? 'Online' : 'Walking on Road',
      bio,
      hub,
      gender,
      cityId: cityId as any,
    });
  }
  return simulated.sort((a, b) => a.distanceMeter - b.distanceMeter);
}

export default function RadarView({
  people,
  currentCity,
  onOpenChatWithPerson,
  onSendFriendRequest,
  friendRequestsSent,
}: RadarViewProps) {
  const [isBroadcasting, setIsBroadcasting] = useState(true);
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [selectedRadius, setSelectedRadius] = useState<number>(50000);
  const [selectedPerson, setSelectedPerson] = useState<RadarPerson | null>(null);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHubFilter, setSelectedHubFilter] = useState<string>('All Localities');

  // Toggle for testing 200+ Users
  const [isSimulating200Plus, setIsSimulating200Plus] = useState(false);

  // State for toggling full grid view vs suggested view (Start TRUE so searchable grid is immediately visible and accessible!)
  const [showAllPeopleList, setShowAllPeopleList] = useState(true);

  // Real Browser GPS Geolocation state (Production grade location tracking + fallback)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stay_dine_last_coords');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
      const savedProfile = localStorage.getItem('stay_dine_user_profile');
      if (savedProfile) {
        try {
          const p = JSON.parse(savedProfile);
          if (p.lat && p.lng) return { lat: p.lat, lng: p.lng };
        } catch (e) {}
      }
    }
    return currentCity?.coordinates ? { lat: currentCity.coordinates.lat, lng: currentCity.coordinates.lng } : { lat: 23.3645, lng: 85.3195 };
  });
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'active' | 'denied'>('active');

  const handleEnableRealGps = () => {
    if (!typeof window || !navigator.geolocation) {
      console.warn('Geolocation is not supported by your browser.');
      alert('Location is not supported by your browser.');
      return;
    }
    setGpsStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setGpsStatus('active');
        if (typeof window !== 'undefined') {
          localStorage.setItem('stay_dine_last_coords', JSON.stringify(coords));
        }
        alert('Location access granted successfully!');
      },
      (err) => {
        console.warn('GPS Denied/Unavailable:', err.message);
        setGpsStatus('denied'); // Show denied state
        alert('Location access was denied. Please go to your browser settings > Site Settings > Location and explicitly ALLOW it for this site.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Automatically trigger real GPS silently on mount right away without requiring clicks
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load exact last coordinates or default anchors instantly
    const savedCoords = localStorage.getItem('stay_dine_last_coords');
    if (savedCoords) {
      try {
        setUserCoords(JSON.parse(savedCoords));
        setGpsStatus('active');
      } catch (e) {}
    } else if (currentCity?.coordinates) {
      const fallback = { lat: currentCity.coordinates.lat, lng: currentCity.coordinates.lng };
      setUserCoords(fallback);
      setGpsStatus('active');
    }

    // Continuous Real-Time GPS Tracking ("chaahe bike ya fir walk toh wo 50 meter uske paas se calculate hote rehna chahiye")
    let watchId: number | null = null;
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          setGpsStatus('active');
          localStorage.setItem('stay_dine_last_coords', JSON.stringify(coords));
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
      );

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          setGpsStatus('active');
          localStorage.setItem('stay_dine_last_coords', JSON.stringify(coords));
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 3000 }
      );
    }
    return () => { if (watchId !== null && 'geolocation' in navigator) navigator.geolocation.clearWatch(watchId); };
  }, [currentCity]);

  const [myProfileId, setMyProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMyProfile = () => {
        const saved = localStorage.getItem('stay_dine_user_profile');
        if (saved) {
          try {
            const p = JSON.parse(saved);
            if (p.id) setMyProfileId(p.id);
          } catch (e) {}
        }
      };
      checkMyProfile();
      window.addEventListener('storage', checkMyProfile);
      return () => window.removeEventListener('storage', checkMyProfile);
    }
  }, []);

  const activePeopleList = useMemo(() => {
    let list = isSimulating200Plus
      ? generate200PlusPeers(people, currentCity.id)
      : people.filter(p => p.cityId === currentCity.id);

    // Get our own full profile details from localStorage or state to guarantee we NEVER see ourselves
    let myName = '';
    let myEmail = '';
    let myId = myProfileId || '';
    if (typeof window !== 'undefined') {
      try {
        const pRaw = localStorage.getItem('stay_dine_user_profile');
        if (pRaw) {
          const p = JSON.parse(pRaw);
          if (p.id) myId = p.id;
          if (p.full_name) myName = p.full_name.trim().toLowerCase();
          else if (p.fullName) myName = p.fullName.trim().toLowerCase();
          if (p.email) myEmail = p.email.trim().toLowerCase();
        }
      } catch {}
    }

    list = list.filter((p) => {
      if (myId && p.id === myId) return false;
      if (myName && p.name.trim().toLowerCase() === myName) return false;
      if (myEmail && (p as any).email && (p as any).email.trim().toLowerCase() === myEmail) return false;
      return true;
    });

    // EXACT LIVE GEODESIC DISTANCE RECALCULATION FROM USER ("uske paas se calculate hote rehna chahiye")
    if (userCoords && userCoords.lat && userCoords.lng) {
      const calculateHaversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
      };

      return list.map(p => {
        if (p.coordinates && p.coordinates.lat && p.coordinates.lng) {
          const exactMeters = calculateHaversineMeters(userCoords.lat, userCoords.lng, p.coordinates.lat, p.coordinates.lng);
          return { ...p, distanceMeter: exactMeters };
        }
        return p;
      });
    }
    return list;
  }, [people, currentCity.id, isSimulating200Plus, myProfileId, userCoords]);

  // Dynamic Smart Range Adaptation ("jaise jaise user badhte jayega waise waise range uske sath badhte jayega")
  const effectiveRadius = useMemo(() => {
    // If user explicitly selected a tight proximity filter (like 50m, 100m, 500m), honor exact distance strictly when walking or moving!
    if (selectedRadius <= 500) return selectedRadius;

    // Count exact matches at current selectedRadius
    const exactCount = activePeopleList.filter(p => {
      if (selectedGender !== 'All' && p.gender !== selectedGender) return false;
      if (selectedHubFilter !== 'All Localities' && selectedHubFilter !== 'All Hubs' && p.hub !== selectedHubFilter) return false;
      return p.distanceMeter <= selectedRadius;
    }).length;

    // Automatically expand radius dynamically to connect peers without dead zones on broader exploration
    if (exactCount < 4 && selectedRadius < 50000) {
      const steps = [1000, 2000, 5000, 10000, 25000, 50000];
      for (const step of steps) {
        if (step > selectedRadius) {
          const count = activePeopleList.filter(p => p.distanceMeter <= step).length;
          if (count >= 3 || step === 50000) return step;
        }
      }
    }
    return selectedRadius;
  }, [activePeopleList, selectedGender, selectedRadius, selectedHubFilter]);

  // All people matching filters (`using dynamic effectiveRadius`)
  const filteredPeople = useMemo(() => {
    return activePeopleList.filter((p) => {
      // 1. If user typed a search term, prioritize finding any matching student across the city!
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = p.name.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q) || p.hub.toLowerCase().includes(q);
        if (!matchesQuery) return false;
        return true; // Found matching peer even if slightly outside current radius slider
      }
      // 2. Standard filter checks when not searching
      if (selectedGender !== 'All' && p.gender !== selectedGender) return false;
      if (p.distanceMeter > effectiveRadius) return false;
      if (selectedHubFilter !== 'All Localities' && selectedHubFilter !== 'All Hubs' && p.hub !== selectedHubFilter) return false;
      return true;
    });
  }, [activePeopleList, selectedGender, effectiveRadius, selectedHubFilter, searchQuery]);

  const availableHubs = useMemo(() => {
    const set = new Set<string>();
    activePeopleList.forEach(p => set.add(p.hub));
    return ['All Localities', ...Array.from(set)];
  }, [activePeopleList]);

  const { individualPins, overflowAvatars } = useMemo(() => {
    const sortedByPriority = [...filteredPeople].sort((a, b) => {
      const aMins = a.lastSeenAt ? Math.floor((Date.now() - new Date(a.lastSeenAt).getTime()) / 60000) : 999;
      const aLive = a.isOnline || aMins < 5;
      const bMins = b.lastSeenAt ? Math.floor((Date.now() - new Date(b.lastSeenAt).getTime()) / 60000) : 999;
      const bLive = b.isOnline || bMins < 5;
      
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;
      return a.distanceMeter - b.distanceMeter;
    });
    const topIndividuals = sortedByPriority.slice(0, 8);

    // 8 Pre-computed non-overlapping orbital slots around the radar circle
    // Formed of 2 distinct rings (Inner ring @ 26% radius, Outer ring @ 38% radius)
    // Angles are staggered so no two pins ever overlap or touch each other!
    const ORBITAL_SLOTS = [
      { radiusPercent: 26, angleDeg: 35 },
      { radiusPercent: 26, angleDeg: 155 },
      { radiusPercent: 26, angleDeg: 275 },
      { radiusPercent: 38, angleDeg: 95 },
      { radiusPercent: 38, angleDeg: 215 },
      { radiusPercent: 38, angleDeg: 335 },
      { radiusPercent: 34, angleDeg: 10 },
      { radiusPercent: 34, angleDeg: 190 },
    ];

    const pins = topIndividuals.map((p, idx) => {
      const slot = ORBITAL_SLOTS[idx % ORBITAL_SLOTS.length];
      const angleRad = slot.angleDeg * (Math.PI / 180);
      const x = Math.cos(angleRad) * slot.radiusPercent;
      const y = Math.sin(angleRad) * slot.radiusPercent;
      return { ...p, x, y };
    });

    const remainingAvatars = sortedByPriority.slice(8, 11).map(p => p.avatar);
    return { individualPins: pins, overflowAvatars: remainingAvatars };
  }, [filteredPeople, effectiveRadius]);

  const extraCount = Math.max(0, filteredPeople.length - individualPins.length);

  // Suggested peers: Nearest first, daily rotation, max 8 ("nearest wala pehle then uske dur")
  const suggestions = useMemo(() => {
    // Sort ALL city peers by distance (nearest first → farthest = entire city)
    const sortedAll = [...activePeopleList].sort((a, b) => a.distanceMeter - b.distanceMeter);

    // Daily seed: same suggestions throughout the day, changes next day
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed = ((seed << 5) - seed + today.charCodeAt(i)) | 0;
    seed = Math.abs(seed) + shuffleSeed;

    // Take nearest 24 people, then pick 8 using daily seed rotation
    const pool = sortedAll.slice(0, 24);
    const dailyOffset = seed % Math.max(1, pool.length - 7);
    const selected = pool.slice(dailyOffset, dailyOffset + 8);
    // If not enough from offset, wrap around
    if (selected.length < 8) {
      const remaining = pool.filter(p => !selected.includes(p));
      selected.push(...remaining.slice(0, 8 - selected.length));
    }
    // Always sort final selection by distance (nearest first)
    return selected.sort((a, b) => a.distanceMeter - b.distanceMeter).slice(0, 8);
  }, [activePeopleList, shuffleSeed]);

  const genderOptions = ['All', 'Boys', 'Girls', 'Others'];
  const radiusOptions = [
    { label: '≤ 50m (Next Door)', value: 50 },
    { label: '≤ 150m (Lane)', value: 150 },
    { label: '≤ 500m (Walk)', value: 500 },
    { label: '≤ 2km (Locality)', value: 2000 },
    { label: 'All City (Location Off)', value: 50000 },
  ];

  // Render Suggested Friend Requests component block
  const renderSuggestedSection = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-wider px-1">
            Suggested
          </h3>
        </div>
      </div>
      <div className="flex overflow-x-auto pb-3 pt-1 gap-3.5 no-scrollbar scroll-smooth snap-x snap-mandatory">
        {suggestions.map((peer) => {
          // Freshness badge logic (production-level)
          const lastSeen = peer.lastSeenAt ? new Date(peer.lastSeenAt) : null;
          const minsAgo = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : 999;
          const isLive = peer.isOnline || minsAgo < 5;
          const isRecent = !isLive && minsAgo < 60;
          const freshnessColor = isLive ? 'bg-emerald-500' : isRecent ? 'bg-amber-400' : 'bg-slate-400';
          const freshnessLabel = isLive ? 'Live now' : isRecent ? `${minsAgo}m ago` : minsAgo < 1440 ? `${Number((minsAgo / 60).toFixed(1))}h ago` : 'Seen today';

          // Distance display
          const distLabel = peer.distanceMeter < 1000 ? `${peer.distanceMeter}m` : `${(peer.distanceMeter / 1000).toFixed(1)}km`;

          return (
            <div key={peer.id} onClick={() => setSelectedPerson(peer)}
              className="card p-3.5 w-[138px] sm:w-[152px] shrink-0 snap-start bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl flex flex-col items-center text-center hover:border-[var(--accent)] transition-all cursor-pointer relative shadow-sm group">
              
              {/* Instagram Story Gradient Ring + Profile Pic */}
              <div className="relative mt-1">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-md group-hover:scale-105 transition-transform">
                  <Image width={64} height={64} src={peer.avatar} alt={peer.name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-[var(--bg-card-solid)] block" />
                </div>
                <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[var(--bg-elevated)] ${freshnessColor}`} title={freshnessLabel} />
              </div>

              {/* Name & Proximity & Active Time */}
              <h4 className="text-[13px] font-extrabold text-[var(--text-primary)] truncate w-full mt-2.5">{peer.name}</h4>
              <p className="text-[11px] font-bold text-[var(--accent)] truncate w-full mt-0.5 flex items-center justify-center gap-1">
                <span>📍 {distLabel}</span>
              </p>
              <p className={`text-[10px] font-extrabold truncate w-full ${isLive ? 'text-emerald-500' : isRecent ? 'text-amber-500' : 'text-slate-400'}`}>
                ⏱️ {freshnessLabel}
              </p>
              <p className="text-[10px] font-medium text-[var(--text-tertiary)] truncate w-full mt-0.5">
                {peer.hub || currentCity.defaultHub}
              </p>

              {/* Action Icons Only (Add & Message) - Insta Style Buttons */}
              <div className="flex items-center justify-center gap-2.5 mt-3 pt-2.5 border-t border-[var(--border-subtle)]/50 w-full">
                <button
                  onClick={(e) => { e.stopPropagation(); onSendFriendRequest(peer.id); }}
                  disabled={friendRequestsSent.includes(peer.id)}
                  title={friendRequestsSent.includes(peer.id) ? "Added" : "Add Friend"}
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
                    friendRequestsSent.includes(peer.id)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white hover:scale-110 active:scale-95'
                  }`}>
                  {friendRequestsSent.includes(peer.id)
                    ? <Check className="h-4 w-4" />
                    : <UserPlus className="h-4 w-4" />
                  }
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); onOpenChatWithPerson(peer); }}
                  title="Send Message"
                  className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm">
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 pb-28 md:pb-8">



      {/* 2. Radar Card ("radar upper rahega") */}
      <div className="card overflow-hidden">
        <div className="p-4 pb-3 space-y-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--text-primary)]">People Nearby</h2>
              {gpsStatus === 'denied' && (
                <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Blocked
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEnableRealGps}
                className="px-3 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-colors border shadow-sm bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-card)] flex items-center gap-1"
                title="Refresh Location"
              >
                <MapPin className="h-3 w-3" />
                {gpsStatus === 'locating' ? 'Locating...' : 'Get Location'}
              </button>
              <span className="badge badge-blue font-bold">{filteredPeople.length} online</span>
              <button
                onClick={() => setIsBroadcasting(!isBroadcasting)}
                className={`px-3 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-colors border shadow-sm ${
                  isBroadcasting
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-card)]'
                    : 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30 hover:bg-indigo-500/25'
                }`}
                title={isBroadcasting ? 'Hide yourself from radar' : 'Make yourself visible on radar'}
              >
                {isBroadcasting ? '👻 Ghost' : '⚡ Live'}
              </button>
            </div>
          </div>
          {gpsStatus === 'denied' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mx-4 mb-2 text-xs text-red-400">
              <strong>Location Blocked:</strong> Your browser denied location access. To see people, click the lock icon 🔒 in your address bar, allow Location, then refresh the page.
            </div>
          )}


          {/* Gender Filter */}
          <div className="flex overflow-x-auto no-scrollbar gap-1.5">
            {genderOptions.map((g) => (
              <button key={g} onClick={() => setSelectedGender(g)}
                className={`chip ${selectedGender === g ? 'chip-active' : ''}`}>
                {g}
              </button>
            ))}
          </div>

          {/* Dedicated Radius / Range Filter */}
          <div className="flex items-center gap-2.5 pt-1">
            <span className="text-[10px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <span className="animate-pulse text-[var(--accent)]">📍</span> Area:
            </span>
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 flex-1 pb-1">
              {radiusOptions.map((r) => (
                <button key={r.value} onClick={() => setSelectedRadius(r.value)}
                  className={`chip ${selectedRadius === r.value ? 'chip-active' : ''}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {availableHubs.length > 2 && (
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 pt-1">
              {availableHubs.map((hub) => (
                <button key={hub} onClick={() => setSelectedHubFilter(hub)}
                  className={`chip text-[11px] py-1 ${selectedHubFilter === hub ? 'bg-[var(--accent)] text-white font-bold' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'}`}>
                  <MapPin className="h-3 w-3" /> {hub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 360 Radar Circle ("in desktop bada karo radar ko halka") */}
        <div className="relative w-full aspect-square max-w-[340px] md:max-w-[440px] mx-auto my-6 flex items-center justify-center overflow-visible">
          <div className="relative w-full h-full rounded-full border border-[var(--border-subtle)] flex items-center justify-center bg-[var(--bg-elevated)]/30 shadow-inner">
            <div className="absolute inset-0 rounded-full border border-[var(--border-subtle)]" />
            <div className="absolute inset-[26%] rounded-full border border-[var(--border-subtle)]" />
            <div className="absolute inset-[52%] rounded-full border border-[var(--border-subtle)]" />
            
            {/* Minimal Premium Live Scanning Sweep Animation Effect */}
            {isBroadcasting && (
              <>
                <div className="absolute inset-0 rounded-full animate-[spin_4.5s_linear_infinite] pointer-events-none opacity-55 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_290deg,var(--accent)_360deg)]" />
                <div className="absolute inset-[20%] rounded-full animate-ping opacity-10 border border-[var(--accent)] pointer-events-none" style={{ animationDuration: '3s' }} />
              </>
            )}

            <div className="absolute inset-[46%] rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/40 flex items-center justify-center z-10 shadow-md">
              <span className={`h-2.5 w-2.5 rounded-full ${isBroadcasting ? 'bg-[var(--accent)] animate-pulse' : 'bg-[var(--accent-amber)]'}`} />
            </div>

            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--border-subtle)]" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--border-subtle)]" />

            {/* Layer 1: Top 7 Nearest Individuals */}
            <AnimatePresence>
              {individualPins.map((p) => {
                const isSelected = selectedPerson?.id === p.id;
                const isNearBottom = p.y > 15;
                const lastSeen = p.lastSeenAt ? new Date(p.lastSeenAt) : null;
                const minsAgo = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : 999;
                const isLive = p.isOnline || minsAgo < 5;
                const activeLabel = isLive ? 'Live now' : minsAgo < 60 ? `${minsAgo}m ago` : minsAgo < 1440 ? `${Number((minsAgo / 60).toFixed(1))}h ago` : 'today';

                return (
                  <motion.div key={p.id}
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: isSelected ? 1.15 : 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ position: 'absolute', top: `${50 + p.y}%`, left: `${50 + p.x}%`, transform: 'translate(-50%,-50%)' }}
                    onClick={(e) => { e.stopPropagation(); setSelectedPerson(p); }}
                    className={`z-20 flex flex-col items-center gap-0.5 cursor-pointer ${isSelected ? 'z-30' : ''}`}
                  >
                    {isSelected && isNearBottom && (
                      <div className="px-2 py-1 rounded-xl bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] shadow-2xl mb-1 flex items-center gap-1.5 animate-scale-in z-50">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[var(--text-primary)] whitespace-nowrap">{p.name.split(' ')[0]}</span>
                          {!isLive && <span className="text-[8px] font-bold text-amber-500/90 whitespace-nowrap">Seen {activeLabel}</span>}
                        </div>
                        <div className="flex items-center gap-1 border-l border-[var(--border-subtle)] pl-1.5">
                          <button onClick={(e) => { e.stopPropagation(); onOpenChatWithPerson(p); }} title="Message"
                            className="p-1 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors">
                            <MessageCircle className="h-3 w-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onSendFriendRequest(p.id); }} title="Add Friend"
                            disabled={friendRequestsSent.includes(p.id)}
                            className="p-1 rounded-md bg-[var(--accent-green)]/15 text-[var(--accent-green)] hover:bg-[var(--accent-green)] hover:text-white transition-colors disabled:opacity-50">
                            {friendRequestsSent.includes(p.id) ? <Check className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className={`relative rounded-full transition-all ${isSelected ? 'ring-[3px] ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-primary)]' : ''}`}>
                      <Image width={48} height={48} src={p.avatar} alt={p.name}
                        className={`rounded-full object-cover border-2 border-[var(--bg-primary)] shadow-xl transition-all ${
                          isSelected ? 'h-12 w-12' : 'h-9 w-9'
                        }`} />
                      <span className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[var(--bg-primary)] ${
                        isSelected ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5'
                      } ${isLive ? 'bg-[var(--accent-green)]' : 'bg-amber-500'}`} />
                    </div>

                    {isSelected && !isNearBottom ? (
                      <div className="px-2 py-1 rounded-xl bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] shadow-2xl mt-1 flex items-center gap-1.5 animate-scale-in z-50">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[var(--text-primary)] whitespace-nowrap">
                            {p.name.split(' ')[0]} <span className="text-[var(--accent)] font-extrabold">({p.distanceMeter < 1000 ? `${p.distanceMeter}m` : `${(p.distanceMeter/1000).toFixed(1)}km`})</span>
                          </span>
                          {!isLive && <span className="text-[8px] font-bold text-amber-500/90 whitespace-nowrap">Seen {activeLabel}</span>}
                        </div>
                        <div className="flex items-center gap-1 border-l border-[var(--border-subtle)] pl-1.5">
                          <button onClick={(e) => { e.stopPropagation(); onOpenChatWithPerson(p); }} title="Message"
                            className="p-1 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors">
                            <MessageCircle className="h-3 w-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onSendFriendRequest(p.id); }} title="Add Friend"
                            disabled={friendRequestsSent.includes(p.id)}
                            className="p-1 rounded-md bg-[var(--accent-green)]/15 text-[var(--accent-green)] hover:bg-[var(--accent-green)] hover:text-white transition-colors disabled:opacity-50">
                            {friendRequestsSent.includes(p.id) ? <Check className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    ) : !isSelected ? (
                      <div className="flex flex-col items-center mt-0.5">
                        <span className="text-[10px] font-extrabold text-[var(--text-secondary)] whitespace-nowrap drop-shadow flex items-center gap-0.5">
                          <span>{p.name.split(' ')[0]}</span>
                          <span className="text-[var(--accent)] font-black">· {p.distanceMeter < 1000 ? `${p.distanceMeter}m` : `${(p.distanceMeter/1000).toFixed(1)}km`}</span>
                        </span>
                        {!isLive && <span className="text-[8px] font-bold text-amber-500/90 whitespace-nowrap drop-shadow-sm -mt-0.5">Seen {activeLabel}</span>}
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Layer 2: Stacked Overlapping Profile Thumbnails + Badge ("uske baad wala profile dikhake + de dena uspe click kre sab dikhe niche") */}
            {extraCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllPeopleList(true);
                  setTimeout(() => {
                    const el = document.getElementById('people-nearby-list');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 pr-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-[var(--accent)] text-white shadow-2xl border border-white/30 cursor-pointer hover:scale-105 transition-transform"
                title="Tap to expand all active people in radius below"
              >
                <div className="flex -space-x-2.5 overflow-hidden pl-1">
                  {overflowAvatars.map((av, i) => (
                    <Image width={24} height={24} key={i} src={av} alt="peer" className="inline-block h-6 w-6 rounded-full ring-2 ring-purple-900 object-cover" />
                  ))}
                </div>
                <span className="text-[11px] font-black tracking-tight whitespace-nowrap flex items-center gap-1">
                  +{extraCount} More <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
                </span>
              </motion.div>
            )}

            {!isBroadcasting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-[var(--bg-card-solid)]/95 p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xl max-w-[200px]">
                  <EyeOff className="h-6 w-6 text-[var(--accent-amber)] mx-auto mb-2" />
                  <p className="text-xs text-[var(--text-secondary)]">Turn on broadcast to discover nearby people</p>
                </div>
              </div>
            )}
            {isBroadcasting && filteredPeople.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-[var(--bg-card-solid)]/95 p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xl max-w-[200px]">
                  <p className="text-xs text-[var(--text-secondary)]">No one in this radius. Try expanding to <strong className="text-[var(--accent)]">250m</strong> or <strong className="text-[var(--accent)]">1 km</strong>.</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Trigger: Explore List */}
          {filteredPeople.length > 0 && (
            <button
              id="radar-banner"
              onClick={() => {
                setShowAllPeopleList(!showAllPeopleList);
                setTimeout(() => {
                  const el = document.getElementById(showAllPeopleList ? 'radar-banner' : 'people-nearby-list');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-[11px] font-black shadow-xl flex items-center gap-2 transition-all z-10 whitespace-nowrap border border-[var(--glass-border)] backdrop-blur-md hover:scale-105"
              style={{ background: 'var(--glass-bg)' }}
            >
              {showAllPeopleList ? (
                <>
                  <span className="uppercase tracking-wider text-[var(--text-secondary)] font-extrabold">Close</span>
                  <ChevronUp className="h-3.5 w-3.5 text-[var(--text-secondary)] opacity-80" />
                </>
              ) : (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-green)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent-green)]"></span>
                  </span>
                  <span className="uppercase tracking-wider text-[var(--text-primary)]">{filteredPeople.length} People Nearby</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[var(--text-primary)] opacity-80" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Selected Person Action Modal (Fixed Center Overlay) */}
      <AnimatePresence>
        {selectedPerson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
               onClick={() => setSelectedPerson(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-3 sm:p-4 border border-[var(--border-subtle)] shadow-2xl relative w-full max-w-sm bg-[var(--bg-card-solid)] rounded-3xl overflow-hidden flex flex-col items-center"
            >
              {/* Close Button floating over photo */}
              <button
                onClick={() => setSelectedPerson(null)}
                className="absolute top-5 right-5 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-red-500 transition-all backdrop-blur-sm shadow-md"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Large Full-Screen Profile Pic Viewer ("sirf modal mei pic") */}
              <div className="w-full relative aspect-[4/5] max-h-[360px] sm:max-h-[420px] rounded-2xl overflow-hidden bg-black/40 border border-[var(--border-subtle)] shadow-inner">
                <Image width={400} height={500} src={selectedPerson.avatar} alt={selectedPerson.name}
                  className="w-full h-full object-cover" />
                
                {/* Gradient overlay at bottom of photo for text legibility */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-3 px-4 flex flex-col justify-end text-left">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xl font-black text-white truncate drop-shadow-md">{selectedPerson.name}</h4>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 shrink-0">{selectedPerson.gender}</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-300 mt-1 flex items-center gap-1.5 drop-shadow">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    📍 {selectedPerson.distanceMeter < 1000 ? `${selectedPerson.distanceMeter}m` : `${(selectedPerson.distanceMeter / 1000).toFixed(1)}km`} · {selectedPerson.hub}
                  </p>
                </div>
              </div>

              {/* Optional short bio */}
              {selectedPerson.bio && (
                <p className="text-xs text-[var(--text-secondary)] mt-3 text-center px-2 line-clamp-2 italic">
                  "{selectedPerson.bio}"
                </p>
              )}

              {/* Action Buttons (Add & Message) */}
              <div className="flex gap-3 mt-3.5 w-full">
                <button
                  onClick={() => { onSendFriendRequest(selectedPerson.id); }}
                  disabled={friendRequestsSent.includes(selectedPerson.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md ${
                    friendRequestsSent.includes(selectedPerson.id)
                      ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)] border border-[var(--accent-green)]/40'
                      : 'bg-[var(--accent-purple)] text-white hover:opacity-90 active:scale-95'
                  }`}
                >
                  {friendRequestsSent.includes(selectedPerson.id) ? (
                    <><Check className="h-4 w-4" /> Added</>
                  ) : (
                    <><UserPlus className="h-4 w-4" /> Add Friend</>
                  )}
                </button>

                <button
                  onClick={() => { const p = selectedPerson; setSelectedPerson(null); onOpenChatWithPerson(p); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-blue-600 text-white text-xs sm:text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-md"
                >
                  <MessageCircle className="h-4 w-4" /> Message
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div id="suggested-section-anchor" className="pt-4" />

      {/* Main List Section */}
      {!showAllPeopleList ? (
        renderSuggestedSection()
      ) : (
        <div id="people-nearby-list" className="space-y-3">
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredPeople.map((p) => {
              const lastSeen = p.lastSeenAt ? new Date(p.lastSeenAt) : null;
              const minsAgo = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : 999;
              const isLive = p.isOnline || minsAgo < 5;
              const isRecent = !isLive && minsAgo < 60;
              const activeLabel = isLive ? '🟢 Live now' : isRecent ? `🟡 Active ${minsAgo}m ago` : minsAgo < 1440 ? `Seen ${Number((minsAgo / 60).toFixed(1))}h ago` : 'Seen today';
              const distLabel = p.distanceMeter < 1000 ? `${p.distanceMeter}m away` : `${(p.distanceMeter / 1000).toFixed(1)}km away`;

              return (
                <div key={`list-${p.id}`} onClick={() => { setSelectedPerson(p); window.scrollTo({ top: 120, behavior: 'smooth' }); }}
                  className="card p-3.5 flex items-center gap-3 cursor-pointer hover:border-[var(--accent)] transition-all">
                  <div className="relative shrink-0">
                    <Image width={48} height={48} src={p.avatar} alt={p.name} className="h-12 w-12 rounded-full object-cover border-2 border-[var(--border-subtle)]" />
                    <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--bg-card-solid)] ${isLive ? 'bg-emerald-500' : isRecent ? 'bg-amber-400' : 'bg-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold text-[var(--text-primary)] truncate">{p.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] font-bold text-[var(--text-secondary)]">{p.gender}</span>
                    </div>
                    <p className="text-xs font-semibold text-[var(--accent)] truncate mt-0.5 flex items-center gap-1.5">
                      <span>📍 {distLabel}</span>
                      <span className="text-[10px] text-[var(--text-tertiary)] opacity-60">•</span>
                      <span className={isLive ? 'text-emerald-500' : isRecent ? 'text-amber-500' : 'text-[var(--text-tertiary)]'}>{activeLabel}</span>
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">{p.bio}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-2 py-1 rounded-md mt-0.5">{p.status}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                </div>
              );
            })}
          </div>

          {/* See Less Button at the bottom of expanded list */}
          {filteredPeople.length > 3 && (
            <button
              onClick={() => {
                setShowAllPeopleList(false);
                setTimeout(() => {
                  const el = document.getElementById('radar-banner');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="w-full mt-2 text-xs font-extrabold text-[var(--text-primary)] flex items-center justify-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] py-3 rounded-xl hover:bg-[var(--border-subtle)] transition-colors"
            >
              See Less <ChevronUp className="h-4 w-4" />
            </button>
          )}

          {/* Suggested moves underneath when Grid is open! */}
          <div className="pt-4 border-t border-[var(--border-subtle)] mt-2">
            {renderSuggestedSection()}
          </div>
        </div>
      )}
    </div>
  );
}
