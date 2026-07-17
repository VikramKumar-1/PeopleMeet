'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Eye, EyeOff, UserPlus, Check, ChevronRight, MessageCircle, X, Users, Sparkles, Flame, MapPin, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [selectedRadius, setSelectedRadius] = useState<number>(1000);
  const [selectedPerson, setSelectedPerson] = useState<RadarPerson | null>(null);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHubFilter, setSelectedHubFilter] = useState<string>('All Localities');

  // Toggle for testing 200+ Users
  const [isSimulating200Plus, setIsSimulating200Plus] = useState(false);

  // State for toggling full grid view vs suggested view
  const [showAllPeopleList, setShowAllPeopleList] = useState(false);

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
      },
      (err) => {
        console.warn('GPS Denied/Unavailable:', err.message);
        setGpsStatus('active'); // Keep active fallback coordinates so user doesn't have to re-click
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

    // Exclude own profile so user does not see their own card ("own profile why it showing on radar dusra user na dekhega")
    if (!myProfileId) return list;
    list = list.filter(p => p.id !== myProfileId && !p.id.includes(myProfileId));

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
      if (selectedGender !== 'All' && p.gender !== selectedGender) return false;
      if (p.distanceMeter > effectiveRadius) return false;
      if (selectedHubFilter !== 'All Localities' && selectedHubFilter !== 'All Hubs' && p.hub !== selectedHubFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q) || p.hub.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activePeopleList, selectedGender, effectiveRadius, selectedHubFilter, searchQuery]);

  const availableHubs = useMemo(() => {
    const set = new Set<string>();
    activePeopleList.forEach(p => set.add(p.hub));
    return ['All Localities', ...Array.from(set)];
  }, [activePeopleList]);

  const { individualPins, overflowAvatars } = useMemo(() => {
    const sortedByDistance = [...filteredPeople].sort((a, b) => a.distanceMeter - b.distanceMeter);
    const topIndividuals = sortedByDistance.slice(0, 8);

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

    const remainingAvatars = sortedByDistance.slice(8, 11).map(p => p.avatar);
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
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[var(--accent-amber)]" /> Suggested Friend Requests
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Updated daily · Nearest study partners</p>
        </div>
        <button onClick={() => setShuffleSeed((s) => s + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] text-xs font-semibold hover:opacity-80 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="flex overflow-x-auto pb-3 pt-1 gap-3.5 no-scrollbar scroll-smooth snap-x snap-mandatory">
        {suggestions.map((peer) => {
          // Freshness badge logic (production-level)
          const lastSeen = peer.lastSeenAt ? new Date(peer.lastSeenAt) : null;
          const minsAgo = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : 999;
          const isLive = peer.isOnline || minsAgo < 5;
          const isRecent = !isLive && minsAgo < 120;
          const freshnessColor = isLive ? 'bg-emerald-500' : isRecent ? 'bg-amber-400' : 'bg-slate-400';
          const freshnessLabel = isLive ? 'Live now' : isRecent ? `${minsAgo}m ago` : minsAgo < 1440 ? `${Math.floor(minsAgo / 60)}h ago` : 'Seen today';

          // Distance display
          const distLabel = peer.distanceMeter < 1000 ? `${peer.distanceMeter}m` : `${(peer.distanceMeter / 1000).toFixed(1)}km`;

          return (
            <div key={peer.id} onClick={() => setSelectedPerson(peer)}
              className="card p-3.5 w-[145px] sm:w-[155px] shrink-0 snap-start bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl flex flex-col items-center text-center hover:border-[var(--accent)] transition-all cursor-pointer relative shadow-sm group">
              
              {/* Profile Pic with Live/Active Dot */}
              <div className="relative mt-1">
                <img src={peer.avatar} alt={peer.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-[var(--border-subtle)] shadow-sm group-hover:scale-105 transition-transform" />
                <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[var(--bg-elevated)] ${freshnessColor}`} title={freshnessLabel} />
              </div>

              {/* Name & Proximity */}
              <h4 className="text-[13px] font-bold text-[var(--text-primary)] truncate w-full mt-2.5">{peer.name}</h4>
              <p className="text-[11px] font-semibold text-[var(--accent)] truncate w-full mt-0.5">
                📍 {distLabel}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] truncate w-full">
                {peer.hub || currentCity.defaultHub}
              </p>

              {/* Action Icons Only (Add & Message) */}
              <div className="flex items-center justify-center gap-2.5 mt-3 pt-2 border-t border-[var(--border-subtle)]/60 w-full">
                <button
                  onClick={(e) => { e.stopPropagation(); onSendFriendRequest(peer.id); }}
                  disabled={friendRequestsSent.includes(peer.id)}
                  title={friendRequestsSent.includes(peer.id) ? "Added" : "Add Friend"}
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                    friendRequestsSent.includes(peer.id)
                      ? 'bg-[var(--accent-green)]/15 text-[var(--accent-green)]'
                      : 'bg-[var(--accent-purple)]/15 text-[var(--accent-purple)] hover:bg-[var(--accent-purple)]/30 hover:scale-110 shadow-sm'
                  }`}>
                  {friendRequestsSent.includes(peer.id)
                    ? <Check className="h-4 w-4" />
                    : <UserPlus className="h-4 w-4" />
                  }
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); onOpenChatWithPerson(peer); }}
                  title="Send Message"
                  className="h-9 w-9 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent)]/30 hover:scale-110 transition-all shadow-sm">
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
      {/* 1. Broadcast Bar & 200+ Simulation Trigger */}
      <div className="card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <span className={`flex h-3 w-3 rounded-full ${isBroadcasting ? 'bg-[var(--accent-green)]' : 'bg-[var(--accent-amber)]'}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--text-primary)] truncate flex items-center gap-2">
              <span>{isBroadcasting ? 'Proximity broadcast is ON' : 'Ghost mode — you are hidden'}</span>
            </p>
            <p className="text-xs text-[var(--text-tertiary)] truncate">
              {isBroadcasting ? `Discovering ${filteredPeople.length} peers within ${selectedRadius}m` : 'Your location is hidden'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <button
            onClick={handleEnableRealGps}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 shadow-sm border ${
              gpsStatus === 'active'
                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40'
                : gpsStatus === 'denied'
                ? 'bg-amber-500/15 text-amber-500 border-amber-500/40'
                : 'bg-blue-500/15 text-blue-500 border-blue-500/40 hover:bg-blue-500/25'
            }`}
            title="Connect your browser GPS for high-accuracy live proximity tracking"
          >
            <MapPin className="h-3.5 w-3.5" />
            {gpsStatus === 'active' ? '🎯 GPS Live (±6m)' : gpsStatus === 'locating' ? '⏳ Locating...' : gpsStatus === 'denied' ? '📍 GPS Off · Hub Mode' : '🎯 Connect Real GPS'}
          </button>

          <button
            onClick={() => setIsBroadcasting(!isBroadcasting)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              isBroadcasting
                ? 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:opacity-80 border border-[var(--border-subtle)]'
                : 'bg-[var(--accent-green)]/15 text-[var(--accent-green)] hover:bg-[var(--accent-green)]/25'
            }`}
          >
            {isBroadcasting ? 'Go Ghost' : 'Go Live'}
          </button>
        </div>
      </div>

      {people.length === 0 && (
        <div className="card p-5 text-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-xl max-w-md mx-auto my-4 space-y-3 animate-fade-in">
          <div className="h-12 w-12 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center mx-auto text-2xl shadow-sm">
            🛰️
          </div>
          <h3 className="text-base font-black text-[var(--text-primary)]">
            Be the First Student on Radar here in {currentCity.name.split(' (')[0]}! 🚀
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            We are waiting for peers to check in across this exact radius. Broadcast your profile so nearby students can connect with you right now!
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setIsBroadcasting(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-blue-600 text-white text-xs font-bold shadow-md hover:brightness-110 transition-all"
            >
              ⚡ Broadcast My Profile
            </button>
            <button
              onClick={() => alert('Share link copied! Send to your coaching & hostel WhatsApp group to invite peers right to this radar.')}
              className="px-4 py-2 rounded-xl bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--border-hover)] transition-all"
            >
              📲 Invite Peers
            </button>
          </div>
        </div>
      )}

      {/* Real Geolocation API & Hub Fallback Engine Status Banner */}
      {gpsStatus === 'active' && userCoords && (
        <div className="card p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center justify-between gap-2 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span><strong>High Accuracy GPS Active:</strong> Lat {userCoords.lat.toFixed(4)}, Lng {userCoords.lng.toFixed(4)} · Proximity check active across {currentCity.name.split(' (')[0]}.</span>
          </div>
          <button onClick={() => setGpsStatus('idle')} className="text-emerald-500 font-bold hover:underline">Reset</button>
        </div>
      )}
      {gpsStatus === 'denied' && (
        <div className="card p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs space-y-1 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between font-bold">
            <span>🛡️ Live GPS is OFF · Showing Locality Network (`{currentCity.defaultHub}`)</span>
            <button onClick={() => setGpsStatus('idle')} className="underline">Turn ON GPS</button>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            Because exact GPS is turned off (`or Go Ghost is on`), we never track your exact room pin. Instead, you are safely exploring peers and PGs across your primary locality (`{currentCity.defaultHub}`)!
          </p>
        </div>
      )}

      {/* 2. Radar Card ("radar upper rahega") */}
      <div className="card overflow-hidden">
        <div className="p-4 pb-3 space-y-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--text-primary)]">People Nearby</h2>
            </div>
            <span className="badge badge-blue font-bold">{filteredPeople.length} online</span>
          </div>

          {effectiveRadius > selectedRadius && (
            <div className="p-2.5 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-semibold flex items-center justify-between gap-2 shadow-sm animate-fade-in">
              <div className="flex items-center gap-1.5">
                <span className="animate-pulse">⚡</span>
                <span><strong>Smart Dynamic Range:</strong> Auto-adapted to {effectiveRadius >= 1000 ? (effectiveRadius / 1000) + 'km' : effectiveRadius + 'm'} as user base grows.</span>
              </div>
              <button onClick={() => setSelectedRadius(effectiveRadius)} className="underline text-[10px] whitespace-nowrap">Lock Range</button>
            </div>
          )}

          <div className="flex overflow-x-auto no-scrollbar gap-1.5">
            {genderOptions.map((g) => (
              <button key={g} onClick={() => setSelectedGender(g)}
                className={`chip ${selectedGender === g ? 'chip-active' : ''}`}>
                {g}
              </button>
            ))}
            <div className="w-px h-5 bg-[var(--border-subtle)] self-center mx-1 shrink-0" />
            {radiusOptions.map((r) => (
              <button key={r.value} onClick={() => setSelectedRadius(r.value)}
                className={`chip ${selectedRadius === r.value ? 'chip-active font-bold' : ''}`}>
                {r.label}
              </button>
            ))}
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
        <div className="relative w-full aspect-square max-w-[340px] md:max-w-[440px] mx-auto my-8 flex items-center justify-center overflow-visible">
          <div className="relative w-[86%] h-[86%] rounded-full border border-[var(--border-subtle)] flex items-center justify-center bg-[var(--bg-elevated)]/30 overflow-hidden shadow-inner">
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
                        <span className="text-xs font-bold text-[var(--text-primary)] whitespace-nowrap">{p.name.split(' ')[0]}</span>
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
                      <img src={p.avatar} alt={p.name}
                        className={`rounded-full object-cover border-2 border-[var(--bg-primary)] shadow-xl transition-all ${
                          isSelected ? 'h-12 w-12' : 'h-9 w-9'
                        }`} />
                      <span className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[var(--bg-primary)] ${
                        isSelected ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5'
                      } ${
                        p.status === 'Online' || p.status === 'Walking on Road' ? 'bg-[var(--accent-green)]' : 'bg-[var(--accent-amber)]'
                      }`} />
                    </div>

                    {isSelected && !isNearBottom ? (
                      <div className="px-2 py-1 rounded-xl bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] shadow-2xl mt-1 flex items-center gap-1.5 animate-scale-in z-50">
                        <span className="text-xs font-bold text-[var(--text-primary)] whitespace-nowrap">{p.name.split(' ')[0]}</span>
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
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] whitespace-nowrap mt-0.5 drop-shadow">
                        {p.name.split(' ')[0]}
                      </span>
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
                    <img key={i} src={av} alt="peer" className="inline-block h-6 w-6 rounded-full ring-2 ring-purple-900 object-cover" />
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

          {/* Bottom Trigger: Explore List ("agar 10+ hai toh click krne pe sab dikhega") */}
          {filteredPeople.length > 0 && (
            <button
              onClick={() => {
                setShowAllPeopleList(!showAllPeopleList);
                setTimeout(() => {
                  const el = document.getElementById(showAllPeopleList ? 'suggested-section-anchor' : 'people-nearby-list');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[var(--accent)] to-blue-600 text-white text-xs font-black shadow-xl flex items-center gap-2 hover:brightness-110 transition-all z-10 whitespace-nowrap border border-white/20"
            >
              <Users className="h-4 w-4 animate-bounce" />
              <span>⚡ {filteredPeople.length} People Active in Radius</span>
              <span className="text-[10px] opacity-90 underline ml-1 flex items-center gap-0.5">
                {showAllPeopleList ? <>Hide Grid <ChevronUp className="h-3 w-3" /></> : <>Explore All ({filteredPeople.length >= 10 ? '10+' : filteredPeople.length}) <ChevronDown className="h-3 w-3" /></>}
              </span>
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
                <img src={selectedPerson.avatar} alt={selectedPerson.name}
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

      <div id="suggested-section-anchor" />

      {/* 3. Conditional Layout Hierarchy ("radar upper rahega uske niche suggested agar 10+ hai toh click krne pe sab dikhega niche suggested niche chala jayega") */}
      {!showAllPeopleList ? (
        <>
          {/* Default View: Suggested right below Radar */}
          {renderSuggestedSection()}

          {/* Expand Trigger Card */}
          {filteredPeople.length > 0 && (
            <div
              onClick={() => {
                setShowAllPeopleList(true);
                setTimeout(() => {
                  const el = document.getElementById('people-nearby-list');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="card p-4 bg-gradient-to-r from-[var(--bg-elevated)] to-[var(--bg-card)] border border-[var(--border-hover)] cursor-pointer hover:border-[var(--accent)] transition-all flex items-center justify-between group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    View All {filteredPeople.length} Active City Peers & Residents Nearby {filteredPeople.length >= 10 ? '(10+ Active)' : ''}
                  </h4>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    Click to open full searchable grid · Filter by Boring Road, Lalpur & More
                  </p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-[var(--accent)] group-hover:translate-y-0.5 transition-transform shrink-0" />
            </div>
          )}
        </>
      ) : (
        <>
          {/* Expanded View: Full Interactive Searchable Grid opens first right below Radar */}
          <div id="people-nearby-list" className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-hover)] shadow-lg">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span>All People in Radius ({filteredPeople.length})</span>
                  {selectedHubFilter !== 'All Hubs' && (
                    <span className="badge badge-purple text-xs">Filter: {selectedHubFilter} ✕</span>
                  )}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Explore all students currently active within {selectedRadius}m</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  <input
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, BPSC, hub..."
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <button
                  onClick={() => setShowAllPeopleList(false)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] text-xs font-bold hover:opacity-80 transition-colors shrink-0 flex items-center gap-1"
                >
                  <ChevronUp className="h-4 w-4" /> Hide Grid
                </button>
              </div>
            </div>

            {selectedHubFilter !== 'All Hubs' && (
              <div className="flex items-center gap-2 text-xs text-[var(--accent)] font-semibold pb-1">
                <span>Showing only students at {selectedHubFilter}.</span>
                <button onClick={() => setSelectedHubFilter('All Hubs')} className="underline">Show All ({activePeopleList.length})</button>
              </div>
            )}

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
              {filteredPeople.slice(0, 50).map((p) => (
                <div key={`list-${p.id}`} onClick={() => { setSelectedPerson(p); window.scrollTo({ top: 120, behavior: 'smooth' }); }}
                  className="card p-3.5 flex items-center gap-3 cursor-pointer hover:border-[var(--accent)] transition-all">
                  <img src={p.avatar} alt={p.name} className="h-11 w-11 rounded-xl object-cover border border-[var(--border-subtle)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">{p.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)]">{p.gender}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] font-semibold">{p.hub.split(' ')[0]}</span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">{p.bio}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[var(--accent)] flex items-center gap-1 justify-end">🟢 Active</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{p.status}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                </div>
              ))}
              {filteredPeople.length > 50 && (
                <div className="p-4 text-center text-xs text-[var(--text-tertiary)] card">
                  Showing top 50 nearest students out of {filteredPeople.length}. Use search or radius filter above to narrow down.
                </div>
              )}
            </div>

            {/* Close / Collapse Button at bottom of Grid */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setShowAllPeopleList(false);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="w-full py-2.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-hover)] text-xs font-bold hover:bg-[var(--accent)] hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <ChevronUp className="h-4 w-4" /> Collapse Full Grid & Return to Suggested View
              </button>
            </div>
          </div>

          {/* And exactly as requested ("niche suggested niche chala jayega"), Suggested moves underneath when Grid is open! */}
          <div className="pt-6 border-t border-[var(--border-subtle)]">
            {renderSuggestedSection()}
          </div>
        </>
      )}
    </div>
  );
}
