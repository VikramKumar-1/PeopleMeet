'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import BottomNav, { TabType } from '@/components/BottomNav';
import CitySelectorModal from '@/components/CitySelectorModal';
import ChatDrawer from '@/components/ChatDrawer';
import ListPropertyModal from '@/components/ListPropertyModal';
import RadarView from '@/components/views/RadarView';
import StayView from '@/components/views/StayView';
import TiffinView from '@/components/views/TiffinView';
import AccountView from '@/components/views/AccountView';
import { CITIES, RADAR_PEOPLE, PG_LISTINGS, FLAT_LISTINGS, TIFFIN_LISTINGS } from '@/data/mockData';
import { isSupabaseReady, fetchLiveProfiles, seedInitialSupabaseData, supabase } from '@/utils/supabase';
import { CityHub, RadarPerson, ChatMessage } from '@/types';
import { CheckCircle2, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [currentCity, setCurrentCity] = useState<CityHub | null>(null);
  const [livePeopleList, setLivePeopleList] = useState<RadarPerson[]>(isSupabaseReady() ? [] : RADAR_PEOPLE);
  const [isLiveDatabaseActive, setIsLiveDatabaseActive] = useState(false);
  const [locationDetectStatus, setLocationDetectStatus] = useState<'detecting' | 'permission_needed' | 'success' | 'failed'>('detecting');
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [isDark, setIsDark] = useState(true);

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [activeChatPerson, setActiveChatPerson] = useState<RadarPerson | null>(null);

  const [friendRequestsSent, setFriendRequestsSent] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Register Service Worker & check initial theme & Run Auto Location Detection
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const hasDark = document.documentElement.classList.contains('dark');
    setIsDark(hasDark);

    // 1. Check if user previously saved city in localStorage
    const savedId = localStorage.getItem('stay_dine_user_city');
    if (savedId) {
      const found = CITIES.find(c => c.id === savedId);
      if (found) {
        setCurrentCity(found);
        setLocationDetectStatus('success');
        return;
      }
    }

    // 2. Auto Location Detection: HTML5 Geolocation -> IP Geo Fallback
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          let closestCity = CITIES[0];
          let minDist = Infinity;
          CITIES.forEach(c => {
            const d = Math.hypot(c.coordinates.lat - userLat, c.coordinates.lng - userLng);
            if (d < minDist) { minDist = d; closestCity = c; }
          });
          setCurrentCity(closestCity);
          setLocationDetectStatus('success');
          localStorage.setItem('stay_dine_user_city', closestCity.id);
        },
        (err) => {
          console.warn('GPS Auto-detect denied/failed:', err.message);
          // Fallback to IP Geolocation (Exact coordinates or Exact City Name match only)
          fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
              const ipLat = parseFloat(data.latitude);
              const ipLng = parseFloat(data.longitude);
              const cityLower = (data.city || '').toLowerCase();

              // 1. Try matching by exact IP coordinates (< 40km from any registered city center)
              if (!isNaN(ipLat) && !isNaN(ipLng)) {
                let closestCity: any = null;
                let minDist = Infinity;
                CITIES.forEach(c => {
                  const dKm = Math.hypot(c.coordinates.lat - ipLat, c.coordinates.lng - ipLng) * 111; // ~111km per lat/lng degree
                  if (dKm < 40 && dKm < minDist) {
                    minDist = dKm;
                    closestCity = c;
                  }
                });
                if (closestCity) {
                  setCurrentCity(closestCity);
                  setLocationDetectStatus('success');
                  localStorage.setItem('stay_dine_user_city', (closestCity as any).id);
                  return;
                }
              }

              // 2. Try exact city name match (e.g. data.city === "jamshedpur" or "ranchi")
              const exactCityMatch = CITIES.find(c =>
                cityLower && (c.id.toLowerCase() === cityLower || c.name.toLowerCase().includes(cityLower))
              );
              if (exactCityMatch) {
                setCurrentCity(exactCityMatch);
                setLocationDetectStatus('success');
                localStorage.setItem('stay_dine_user_city', exactCityMatch.id);
              } else {
                // 3. If exact city match fails or if multiple cities exist in same state, do NOT guess randomly!
                // Show the interactive Select City card so user picks precisely without error.
                setLocationDetectStatus('permission_needed');
              }
            })
            .catch(() => setLocationDetectStatus('permission_needed'));
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 3600000 }
      );
    } else {
      setLocationDetectStatus('permission_needed');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm1', senderId: 'person-p1', receiverId: 'me', text: 'Hey! Are you around Boring Road for BPSC prep?', timestamp: 'Just now', isRead: false },
    { id: 'm2', senderId: 'me', receiverId: 'person-p1', text: 'Yes! Looking for a study partner and good mess.', timestamp: 'Just now', isRead: true },
  ]);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendFriendRequest = (personId: string) => {
    if (!friendRequestsSent.includes(personId)) {
      setFriendRequestsSent([...friendRequestsSent, personId]);
      showToast('Friend request sent!');
    }
  };

  // Supabase Real-Time Data Fetch & Auto-Seed on Empty Database
  useEffect(() => {
    const syncRealProfiles = async () => {
      if (!isSupabaseReady()) return;
      setIsLiveDatabaseActive(true);
      const targetCityId = currentCity ? currentCity.id : 'ranchi';
      const fetched = await fetchLiveProfiles(targetCityId);
      
      if (fetched && fetched.length > 0) {
        setLivePeopleList(fetched);
      } else {
        // If the Supabase table is completely empty (0 rows), auto-seed our initial real records directly into cloud DB!
        const seeded = await seedInitialSupabaseData();
        if (seeded) {
          const reFetched = await fetchLiveProfiles(targetCityId);
          if (reFetched && reFetched.length > 0) {
            setLivePeopleList(reFetched);
          }
        }
      }
    };
    syncRealProfiles();

    // Subscribe to live instant updates (WebSockets)
    if (supabase) {
      const channel = supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          syncRealProfiles();
        })
        .subscribe();
      return () => { supabase?.removeChannel(channel); };
    }
  }, [currentCity]);

  const handleOpenChatWithPerson = (person: RadarPerson) => {
    setActiveChatPerson(person);
    setIsChatDrawerOpen(true);
  };

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = { id: `m-${Date.now()}`, senderId: 'me', receiverId: activeChatPerson?.id ?? 'general', text, timestamp: 'Now', isRead: true };
    setMessages((prev) => [...prev, newMsg]);
    if (activeChatPerson) {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: `r-${Date.now()}`, senderId: activeChatPerson.id, receiverId: 'me',
          text: `Got it! Let's meet near ${currentCity ? currentCity.defaultHub : 'Lalpur'} tonight.`, timestamp: 'Just now', isRead: false,
        }]);
      }, 1200);
    }
  };

  const currentCityPeople = currentCity ? livePeopleList.filter((p) => p.cityId === currentCity.id) : livePeopleList;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentCity={currentCity}
        onOpenCitySelector={() => setIsCityModalOpen(true)}
        onOpenChatDrawer={() => { setActiveChatPerson(null); setIsChatDrawerOpen(true); }}
        onOpenListProperty={() => setIsListModalOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        unreadCount={friendRequestsSent.length > 0 ? 0 : 1}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 pt-5 pb-28 md:bg-[var(--bg-primary)] md:border-x md:border-[var(--border-subtle)] md:shadow-2xl md:min-h-[calc(100vh-65px)] relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key={`${activeTab}-${currentCity?.id || 'none'}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}>

            {currentCity === null ? (
              <div className="card p-6 sm:p-8 text-center max-w-lg mx-auto my-6 space-y-6 animate-fade-in border border-[var(--border-hover)] shadow-2xl">
                <div className="relative h-20 w-20 mx-auto rounded-full bg-[var(--accent)]/15 border-2 border-[var(--accent)]/40 flex items-center justify-center">
                  {locationDetectStatus === 'detecting' ? (
                    <span className="h-10 w-10 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin" />
                  ) : (
                    <MapPin className="h-10 w-10 text-[var(--accent)] animate-bounce" />
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                    {locationDetectStatus === 'detecting' ? '🌍 Auto-Detecting Your City & Hub...' : '📍 Choose Your City or Enable Location'}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                    {locationDetectStatus === 'detecting'
                      ? 'We are checking your GPS coordinates and city boundary to connect you with peers and PGs right near your doorstep...'
                      : 'We could not auto-detect your location automatically. Please select your active city (Ranchi, Patna, Delhi) or grant location access to begin!'}
                  </p>
                </div>

                {locationDetectStatus !== 'detecting' && (
                  <div className="space-y-4 pt-2">
                    <button
                      onClick={() => {
                        setLocationDetectStatus('detecting');
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const userLat = pos.coords.latitude;
                            const userLng = pos.coords.longitude;
                            let closestCity = CITIES[0];
                            let minDist = Infinity;
                            CITIES.forEach(c => {
                              const d = Math.hypot(c.coordinates.lat - userLat, c.coordinates.lng - userLng);
                              if (d < minDist) { minDist = d; closestCity = c; }
                            });
                            setCurrentCity(closestCity);
                            setLocationDetectStatus('success');
                            localStorage.setItem('stay_dine_user_city', closestCity.id);
                            showToast(`📍 Auto-detected location: ${closestCity.name.split(' (')[0]}`);
                          },
                          () => alert('Please allow Location access in your browser to auto-detect.')
                        );
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-[var(--accent)] text-black font-black text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                    >
                      <MapPin className="h-4 w-4 fill-current" /> 🎯 Auto-Detect My Live GPS Location
                    </button>

                    <div className="relative py-2 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-subtle)]" /></div>
                      <span className="relative px-3 bg-[var(--bg-card)] text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">OR SELECT YOUR CITY DIRECTLY</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {CITIES.map((city) => (
                        <button
                          key={city.id}
                          onClick={() => {
                            setCurrentCity(city);
                            setLocationDetectStatus('success');
                            localStorage.setItem('stay_dine_user_city', city.id);
                            showToast(`Welcome to ${city.name.split(' (')[0]}!`);
                          }}
                          className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-left transition-all group"
                        >
                          <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                            {city.name.split(' (')[0]}
                          </p>
                          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 truncate">{city.defaultHub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {activeTab === 'radar' && (
                  <RadarView people={livePeopleList} currentCity={currentCity}
                    onOpenChatWithPerson={handleOpenChatWithPerson}
                    onSendFriendRequest={handleSendFriendRequest} friendRequestsSent={friendRequestsSent} />
                )}

                {activeTab === 'stay' && (
                  <StayView pgs={PG_LISTINGS} flats={FLAT_LISTINGS} currentCity={currentCity}
                    onOpenListModal={() => setIsListModalOpen(true)} />
                )}

                {activeTab === 'tiffin' && (
                  <TiffinView tiffins={TIFFIN_LISTINGS} currentCity={currentCity}
                    onOpenListModal={() => setIsListModalOpen(true)} />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onChangeTab={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* Account Slide-over (Profile) */}
      <AnimatePresence>
        {isAccountOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50" onClick={() => setIsAccountOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[var(--bg-primary)] border-l border-[var(--border-subtle)] z-50 overflow-y-auto">
              <div className="p-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">My Account</h2>
                <button onClick={() => setIsAccountOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors">
                  <X className="h-5 w-5 text-[var(--text-secondary)]" />
                </button>
              </div>
              <div className="p-4">
                <AccountView currentCity={currentCity || CITIES[0]} onOpenListModal={() => setIsListModalOpen(true)}
                  friendRequestsSent={friendRequestsSent} peopleList={currentCityPeople}
                  onOpenChatWithPerson={handleOpenChatWithPerson} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {currentCity && (
        <>
          <CitySelectorModal isOpen={isCityModalOpen} onClose={() => setIsCityModalOpen(false)}
            currentCity={currentCity} onSelectCity={(city) => { setCurrentCity(city); localStorage.setItem('stay_dine_user_city', city.id); showToast(`Switched to ${city.name.split(' (')[0]}`); }} />

          <ListPropertyModal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)}
            currentCity={currentCity} onSuccessListing={(t, c) => showToast(`"${t}" is now live as ${c}!`)} />
        </>
      )}

      <ChatDrawer isOpen={isChatDrawerOpen} onClose={() => setIsChatDrawerOpen(false)}
        activeChatPerson={activeChatPerson} messages={messages}
        onSendMessage={handleSendMessage} onSelectPerson={(p) => setActiveChatPerson(p)} peopleList={currentCityPeople} />

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-6 z-50 max-w-sm mx-auto md:mx-0">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] shadow-2xl">
              <CheckCircle2 className="h-5 w-5 text-[var(--accent-green)] shrink-0" />
              <p className="text-sm font-medium text-[var(--text-primary)]">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
