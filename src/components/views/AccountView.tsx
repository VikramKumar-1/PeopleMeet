'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Sparkles, MessageCircle, ChevronRight, ShieldCheck, UserCheck, LogIn, Edit3 } from 'lucide-react';
import { CityHub, RadarPerson } from '@/types';
import AuthModal from '@/components/AuthModal';

interface AccountViewProps {
  currentCity: CityHub;
  onOpenListModal: () => void;
  friendRequestsSent: string[];
  peopleList: RadarPerson[];
  onOpenChatWithPerson: (person: RadarPerson) => void;
}

export default function AccountView({ currentCity, onOpenListModal, friendRequestsSent, peopleList, onOpenChatWithPerson }: AccountViewProps) {
  const connectedPeople = peopleList.filter((p) => friendRequestsSent.includes(p.id));
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stay_dine_user_profile');
      if (saved) {
        try { setUserProfile(JSON.parse(saved)); } catch (e) {}
      }
    }
  }, []);

  return (
    <div className="space-y-5">
      {/* Profile Card */}
      <div className="card p-5 border-2 border-[var(--border-subtle)] relative overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <img src={userProfile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"}
              alt="Profile" className="h-16 w-16 rounded-2xl object-cover border-2 border-[var(--accent)] shrink-0 shadow-md" />
            <div className="min-w-0">
              <h3 className="text-lg font-black text-[var(--text-primary)] truncate">
                {userProfile?.full_name || 'Anonymous Person'}
              </h3>
              <p className="text-xs font-semibold text-[var(--accent)] flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5" /> {userProfile?.locality_hub || currentCity.defaultHub} · {currentCity.name.split(' (')[0]}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="badge badge-green shrink-0">🟢 {userProfile?.status || 'Active on Radar'}</span>
                {userProfile?.gender && <span className="badge badge-blue shrink-0">{userProfile.gender}</span>}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="p-2.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--accent)] hover:text-white text-[var(--text-secondary)] transition-all shrink-0 border border-[var(--border-subtle)]"
            title={userProfile ? "Edit Profile" : "Sign In / Register"}
          >
            {userProfile ? <Edit3 className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
          </button>
        </div>

        {userProfile?.bio && (
          <div className="mt-4 p-3 rounded-xl bg-[var(--bg-elevated)]/60 border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]">
            💬 <strong>Bio / Need:</strong> {userProfile.bio}
          </div>
        )}

        {!userProfile && (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-blue-600 text-white text-xs font-black shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" /> Sign In / Create Profile to Broadcast on Radar 🚀
          </button>
        )}

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="card-elevated p-3 text-center">
            <p className="text-xl font-black text-[var(--text-primary)]">{connectedPeople.length}</p>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Connected Peers</p>
          </div>
          <div className="card-elevated p-3 text-center">
            <p className="text-xl font-black text-[var(--accent)]">{currentCity.municipalRadiusKm}km</p>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">City Radius</p>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onProfileCreated={(profile) => setUserProfile(profile)}
        editProfileData={userProfile}
      />

      {/* List Property CTA */}
      <button onClick={onOpenListModal}
        className="card w-full text-left p-4 flex items-center justify-between hover:border-[var(--accent-amber)] transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--accent-amber)]/12">
            <Sparkles className="h-5 w-5 text-[var(--accent-amber)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">List your PG, Flat, or Tiffin</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Get featured for ₹500/month</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
      </button>

      {/* Connected Friends */}
      <div>
        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Connected Friends</h4>
        {connectedPeople.length > 0 ? (
          <div className="space-y-2">
            {connectedPeople.map((person) => (
              <button key={person.id} onClick={() => onOpenChatWithPerson(person)}
                className="card w-full text-left p-3.5 flex items-center gap-3 hover:opacity-80 transition-colors">
                <img src={person.avatar} alt={person.name} className="h-10 w-10 rounded-xl object-cover border border-[var(--border-subtle)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{person.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{person.distanceMeter}m · {person.hub}</p>
                </div>
                <MessageCircle className="h-4 w-4 text-[var(--accent)] shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="card p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)] font-semibold">No connections yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Find people on the Radar tab and add them!</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card-elevated p-4 flex items-start gap-3 text-xs text-[var(--text-tertiary)]">
        <ShieldCheck className="h-4 w-4 text-[var(--accent-green)] shrink-0 mt-0.5" />
        <p>Your location data is only shared while Proximity Broadcast is ON. Use Ghost Mode anytime for complete privacy.</p>
      </div>
    </div>
  );
}
