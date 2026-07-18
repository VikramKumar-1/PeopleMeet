'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, MapPin, UserPlus, LogIn, CheckCircle2, ShieldCheck, Mail, Lock, User, Camera, Upload, RefreshCw, Check } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { CityHub } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated?: (profile: { id: string; full_name?: string; avatar_url?: string; [key: string]: unknown }) => void;
  isMandatory?: boolean;
  currentCity?: CityHub | null;
  editProfileData?: { id: string; full_name?: string; avatar_url?: string; gender?: 'Boys' | 'Girls' | 'Others'; locality_hub?: string; bio?: string; email?: string } | null;
}

export default function AuthModal({ isOpen, onClose, onProfileCreated, isMandatory, currentCity, editProfileData }: AuthModalProps) {
  const [mode, setMode] = useState<'signup' | 'login' | 'edit'>(editProfileData ? 'edit' : 'signup');
  const [fullName, setFullName] = useState(editProfileData?.full_name || '');
  const [gender, setGender] = useState<'Boys' | 'Girls' | 'Others'>(editProfileData?.gender || 'Boys');
  const [locality, setLocality] = useState(editProfileData?.locality_hub || 'Lalpur Chowk');
  const [bio, setBio] = useState(editProfileData?.bio || '');
  const [email, setEmail] = useState(editProfileData?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live Selfie & Photo Upload States
  const [customAvatar, setCustomAvatar] = useState<string | null>(editProfileData?.avatar_url || null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      }).then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      }).catch((err) => {
        console.warn('Camera permission error:', err);
        setErrorMsg('Camera access denied or unavailable. Please pick a photo from gallery instead.');
        setIsCameraActive(false);
      });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive, facingMode]);

  const handleSnapSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCustomAvatar(dataUrl);
        setIsCameraActive(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [detectingLocality, setDetectingLocality] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const saved = localStorage.getItem('stay_dine_user_profile');
      if (saved) {
        try {
          const profile = JSON.parse(saved);
          queueMicrotask(() => {
            if (profile.full_name) setFullName(profile.full_name);
            if (profile.gender) setGender(profile.gender);
            if (profile.locality_hub) setLocality(profile.locality_hub);
            if (profile.bio) setBio(profile.bio);
            if (profile.avatar_url) setCustomAvatar(profile.avatar_url);
          });
        } catch {}
      }
    }
  }, [isOpen]);

  const handleDetectLocality = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocality(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`);
          const data = await res.json();
          if (data && data.address) {
            const area = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.road || data.address.city_district || 'Live GPS Hub';
            const city = data.address.city || data.address.town || data.address.state_district || '';
            setLocality(`${area}${city ? `, ${city}` : ''}`);
          } else {
            setLocality(`GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        } catch {
          setLocality(`Live Hub (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        } finally {
          setDetectingLocality(false);
        }
      },
      (err) => {
        console.warn('GPS location error:', err);
        setErrorMsg('Could not detect location automatically. Please type your locality below.');
        setDetectingLocality(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!supabase) {
      setErrorMsg('Database connection not established.');
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim() || !locality.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('⚠️ Please fill out all required fields marked with (*): Name, Locality, Email & Password.');
        setLoading(false);
        return;
      }
      if (password.trim().length < 4) {
        setErrorMsg('⚠️ Password must be at least 4 characters long.');
        setLoading(false);
        return;
      }
      // Check local registered emails list
      const savedEmails = JSON.parse(localStorage.getItem('stay_dine_registered_emails') || '[]');
      if (savedEmails.includes(email.trim().toLowerCase())) {
        setErrorMsg('⚠️ This email address is already registered! Please sign in instead or use another email.');
        setLoading(false);
        return;
      }
      // If Supabase is connected, check profiles table for uniqueness
      if (supabase) {
        try {
          const { data: existing } = await supabase.from('profiles').select('id, email').eq('email', email.trim().toLowerCase());
          if (existing && existing.length > 0) {
            setErrorMsg('⚠️ This email address is already registered! Please sign in instead or use another email.');
            setLoading(false);
            return;
          }
        } catch {}
      }
    }

    try {
      if (mode === 'signup') {
        const defaultAvatar = gender === 'Girls'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

        // 1. Sign Up User via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });

        if (authError) throw authError;

        const userId = authData.user?.id || `u-${Date.now()}`;

        // Capture real GPS for Supabase profile (production-level)
        let realLat = currentCity?.coordinates?.lat ?? 23.3645;
        let realLng = currentCity?.coordinates?.lng ?? 85.3195;
        let locSource: 'gps' | 'signup' = 'signup';
        try {
          const savedCoords = localStorage.getItem('stay_dine_last_coords');
          if (savedCoords) {
            const c = JSON.parse(savedCoords);
            if (c.lat && c.lng) { realLat = c.lat; realLng = c.lng; locSource = 'gps'; }
          }
        } catch {}

        const resolvedCityId = currentCity?.id || 'ranchi';

        const newProfile = {
          id: userId,
          full_name: fullName.trim() || 'New Person',
          email: email.trim().toLowerCase(),
          gender,
          bio: bio.trim() || 'Active peer nearby',
          city_id: resolvedCityId,
          locality_hub: locality.trim(),
          lat: realLat,
          lng: realLng,
          last_lat: realLat,
          last_lng: realLng,
          last_location_at: new Date().toISOString(),
          location_source: locSource,
          is_online: true,
          last_seen_at: new Date().toISOString(),
          status: 'Online',
          avatar_url: customAvatar || defaultAvatar,
        };

        // 2. Insert into Supabase Profiles Table
        const { error: profileError } = await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' });
        if (profileError) {
          console.warn('Profile upsert warning:', profileError.message);
        }

        if (onProfileCreated) onProfileCreated(newProfile);
        setSuccessMsg('Profile registered inside Supabase! Welcome abroad!');
        setTimeout(onClose, 1200);

      } else if (mode === 'edit') {
        if (!editProfileData?.id) throw new Error("Missing profile ID for edit");
        
        const updatedProfile = {
          full_name: fullName.trim() || 'Updated Person',
          gender,
          bio: bio.trim() || 'Active peer nearby',
          locality_hub: locality.trim(),
          avatar_url: customAvatar || editProfileData.avatar_url,
          last_seen_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase.from('profiles').update(updatedProfile).eq('id', editProfileData.id);
        if (updateError) throw updateError;
        
        if (onProfileCreated) onProfileCreated({ id: editProfileData.id, ...updatedProfile });
        setSuccessMsg('Profile details updated successfully! ✨');
        setTimeout(onClose, 1200);
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

          if (profileData && onProfileCreated) {
            onProfileCreated(profileData);
          }
        }
        setSuccessMsg('Successfully signed in!');
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      const errorObj = err as { message?: string; status?: number; code?: string } | undefined;
      const msg = errorObj?.message || '';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered') || errorObj?.status === 422 || errorObj?.code === 'user_already_exists') {
        setErrorMsg('⚠️ This email address is already registered! Please sign in instead or use another unique email.');
      } else {
        setErrorMsg(msg || 'Error processing request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-outfit"
      onClick={isMandatory ? undefined : onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md p-[1.5px] rounded-[28px] bg-gradient-to-b from-indigo-500/60 via-purple-500/30 to-pink-500/20 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.4)] overflow-hidden"
      >
        <div className="relative w-full rounded-[27px] bg-[#090c15]/95 p-4 sm:p-7 backdrop-blur-xl overflow-y-auto max-h-[90vh]">
          {/* Top glowing ambient accent */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-pink-600/30 blur-3xl pointer-events-none" />

          {!isMandatory && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:rotate-90 transition-all duration-300 z-10 border border-white/10"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {isMandatory && (
            <div className="mb-4 p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-semibold flex items-center justify-center gap-2 text-center shadow-inner">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>Sign in to access radar</span>
            </div>
          )}

          <div className="text-center mt-2 relative z-10">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {mode === 'signup' ? 'Join PeopleMeet' : mode === 'edit' ? 'Update Profile' : 'Welcome Back'}
            </h3>
          </div>

          {/* Premium Tab Switcher - Only for Auth */}
          {mode !== 'edit' && (
            <div className="flex rounded-2xl bg-black/40 p-1 my-4 border border-white/10 relative z-10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" /> New Profile
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </button>
            </div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold mb-4 flex items-center gap-2"
            >
              <span className="text-sm">⚠️</span> {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-4 flex items-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> {successMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
            {(mode === 'signup' || mode === 'edit') && (
              <>
                {/* Profile Photo */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                      <span>Profile Photo</span>
                    </label>
                    {customAvatar && (
                      <button
                        type="button"
                        onClick={() => setCustomAvatar(null)}
                        className="text-[10px] text-red-400 hover:underline font-semibold"
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 rounded-2xl overflow-hidden shrink-0 border-2 border-purple-500/50 bg-[#090c15] shadow-md flex items-center justify-center">
                      {customAvatar ? (
                        <img src={customAvatar} alt="preview" className="h-full w-full object-cover" />
                      ) : (
                        <img
                          src={gender === 'Girls' ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                          alt="default"
                          className="h-full w-full object-cover opacity-70"
                        />
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCameraActive(!isCameraActive)}
                        className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/30 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Camera className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">{isCameraActive ? 'Close Camera' : 'Live Selfie'}</span>
                      </button>

                      <label className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                        <Upload className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">Upload Photo</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* HTML5 Live Camera Video Stream & Controls */}
                  <AnimatePresence>
                    {isCameraActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-2 pt-2 border-t border-white/10"
                      >
                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-purple-500/40 shadow-inner flex items-center justify-center max-h-44 mx-auto">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                          />
                        </div>
                        <canvas ref={canvasRef} className="hidden" />

                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-white/10"
                          >
                            <RefreshCw className="h-3 w-3 text-cyan-400" />
                            <span>Flip ({facingMode === 'user' ? 'Selfie' : 'Back'})</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSnapSelfie}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Snap Photo</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center">
                    <span>Full Name</span>
                    <span className="text-red-400 ml-1">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm bg-black/50 border border-white/10 rounded-xl text-white font-medium placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center">
                      <span>Gender</span>
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGender(e.target.value as 'Boys' | 'Girls' | 'Others')}
                      className="w-full px-3.5 py-2 text-[16px] sm:text-xs bg-black/50 border border-white/10 rounded-xl text-white font-semibold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
                    >
                      <option value="Boys" className="bg-[#090c15]">Boys / Male</option>
                      <option value="Girls" className="bg-[#090c15]">Girls / Female</option>
                      <option value="Others" className="bg-[#090c15]">Others</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-semibold text-slate-300 truncate flex items-center">
                        <span>Locality</span>
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleDetectLocality}
                        disabled={detectingLocality}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 shrink-0 transition-all disabled:opacity-50"
                        title="Auto-detect your exact area via GPS"
                      >
                        <MapPin className={`h-3 w-3 ${detectingLocality ? 'animate-bounce text-amber-400' : ''}`} />
                        <span>{detectingLocality ? 'Locating...' : 'Auto GPS'}</span>
                      </button>
                    </div>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajiv Nagar Lane 4"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-[16px] sm:text-xs bg-black/50 border border-white/10 rounded-xl text-white font-semibold placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Short Bio (Exams, Needs, etc.)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BPSC Target 2026. Looking for room partner near library!"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2 text-[16px] sm:text-xs bg-black/50 border border-white/10 rounded-xl text-white font-medium placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </>
            )}

            {(mode === 'signup' || mode === 'login') && (
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-3 shadow-inner">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center">
                    <span>Email Address</span>
                    <span className="text-red-400 ml-1">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="you@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-[16px] sm:text-sm bg-black/50 border border-white/10 rounded-xl text-white font-semibold placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center">
                    <span>Password</span>
                    <span className="text-red-400 ml-1">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-[16px] sm:text-sm bg-black/50 border border-white/10 rounded-xl text-white font-semibold placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-white/15"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin text-base">⏳</span> Connecting to Radar...
                </span>
              ) : mode === 'signup' ? (
                <><UserPlus className="h-4 w-4" /> Create Profile & Go Live on Radar ⚡</>
              ) : (
                <><LogIn className="h-4 w-4" /> Sign In to PeopleMeet 🎯</>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
