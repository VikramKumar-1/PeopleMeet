'use client';

import React, { useState } from 'react';
import { X, Sparkles, MapPin, UserPlus, LogIn, CheckCircle2, ShieldCheck, Mail, Lock, User, Heart } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated?: (profile: any) => void;
}

export default function AuthModal({ isOpen, onClose, onProfileCreated }: AuthModalProps) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Boys' | 'Girls' | 'Others'>('Boys');
  const [locality, setLocality] = useState('Lalpur Chowk');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (!supabase) {
        // Fallback if Supabase keys are still local
        const mockProfile = {
          id: `user-${Date.now()}`,
          full_name: fullName || 'Verified Student',
          gender,
          bio: bio || 'Active on Radar',
          locality_hub: locality,
          city_id: 'ranchi',
          lat: 23.3645,
          lng: 85.3195,
          status: 'Online',
        };
        localStorage.setItem('stay_dine_user_profile', JSON.stringify(mockProfile));
        if (onProfileCreated) onProfileCreated(mockProfile);
        setSuccessMsg('Profile created & active on Radar!');
        setTimeout(() => onClose(), 1000);
        return;
      }

      if (mode === 'signup') {
        // 1. Sign Up User via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });

        if (authError) throw authError;

        const userId = authData.user?.id || `u-${Date.now()}`;
        const newProfile = {
          id: userId,
          full_name: fullName.trim() || 'New Student',
          gender,
          bio: bio.trim() || 'Active peer nearby',
          city_id: 'ranchi',
          locality_hub: locality,
          lat: 23.3645 + (Math.random() - 0.5) * 0.01,
          lng: 85.3195 + (Math.random() - 0.5) * 0.01,
          status: 'Online',
          avatar_url: gender === 'Girls'
            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        };

        // 2. Insert into Supabase Profiles Table
        const { error: profileError } = await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' });
        if (profileError) {
          console.warn('Profile upsert warning:', profileError.message);
        }

        localStorage.setItem('stay_dine_user_profile', JSON.stringify(newProfile));
        if (onProfileCreated) onProfileCreated(newProfile);
        setSuccessMsg('Profile registered inside Supabase! Welcome abroad!');
        setTimeout(() => onClose(), 1200);

      } else {
        // Sign In
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (authError) throw authError;

        if (authData.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileData) {
            localStorage.setItem('stay_dine_user_profile', JSON.stringify(profileData));
            if (onProfileCreated) onProfileCreated(profileData);
          }
        }
        setSuccessMsg('Successfully signed in!');
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
         onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="card p-6 border-2 border-[var(--accent)] shadow-2xl relative w-full max-w-md bg-[var(--bg-card-solid)] overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--accent)] via-purple-500 to-blue-500" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white hover:bg-red-500/20 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mt-1">
          <div className="h-12 w-12 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center mx-auto mb-2 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <h3 className="text-xl font-black text-[var(--text-primary)]">
            {mode === 'signup' ? 'Create Student Profile 🚀' : 'Sign In to Your Account'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {mode === 'signup' ? 'Join thousands of peers across Ranchi & Patna' : 'Welcome back to your PeopleMeet Radar'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-[var(--bg-elevated)] p-1 my-4 border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            New Profile ✨
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            Sign In 🔑
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold mb-3">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input w-full pl-9 py-2 text-sm bg-[var(--bg-elevated)] border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="input w-full py-2 text-xs bg-[var(--bg-elevated)] border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-semibold"
                  >
                    <option value="Boys">Boys / Male</option>
                    <option value="Girls">Girls / Female</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Locality / Hub</label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="input w-full py-2 text-xs bg-[var(--bg-elevated)] border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-semibold"
                  >
                    <option value="Lalpur Chowk">📍 Lalpur Chowk</option>
                    <option value="Kanke Road">📍 Kanke Road</option>
                    <option value="Boring Road">📍 Boring Road</option>
                    <option value="Ashok Rajpath">📍 Ashok Rajpath</option>
                    <option value="BIT Mesra Hub">📍 BIT Mesra Hub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Exam & About Bio (`What do you need?`)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BPSC Target 2026. Looking for room partner near library!"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input w-full py-2 text-xs bg-[var(--bg-elevated)] border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-medium"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Email Address (`or Student ID`)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-tertiary)]" />
              <input
                type="email"
                required
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full pl-9 py-2 text-sm bg-[var(--bg-elevated)] border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-tertiary)]" />
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full pl-9 py-2 text-sm bg-[var(--bg-elevated)] border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-blue-600 text-white text-sm font-black shadow-lg hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin text-lg">⏳</span>
            ) : mode === 'signup' ? (
              <><UserPlus className="h-4 w-4" /> Create Profile & Go Live on Radar ⚡</>
            ) : (
              <><LogIn className="h-4 w-4" /> Sign In to PeopleMeet 🎯</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
