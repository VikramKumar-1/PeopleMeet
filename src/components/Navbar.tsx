'use client';

import React from 'react';
import { MapPin, MessageCircle, Plus, User, Sun, Moon } from 'lucide-react';
import { CityHub } from '@/types';

interface NavbarProps {
  currentCity: CityHub | null;
  onOpenCitySelector: () => void;
  onOpenChatDrawer: () => void;
  onOpenListProperty: () => void;
  onOpenAccount: () => void;
  unreadCount?: number;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Navbar({
  currentCity,
  onOpenCitySelector,
  onOpenChatDrawer,
  onOpenListProperty,
  onOpenAccount,
  unreadCount = 0,
  isDark,
  onToggleTheme,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full pt-safe flex flex-col pointer-events-none">
      {/* Main Top Navbar */}
      <div className="w-full pointer-events-auto border-b border-[var(--border-subtle)]"
           style={{ background: 'var(--glass-bg)', backdropFilter: `blur(var(--glass-blur))`, WebkitBackdropFilter: `blur(var(--glass-blur))` }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-black tracking-tight flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
            We<span style={{ color: 'var(--accent)' }}>Mate</span>✨
            <span className="text-[10px] px-1.5 py-0.5 rounded font-extrabold bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 hidden sm:inline-block">CAMPUS</span>
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenListProperty}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: 'color-mix(in srgb, var(--accent-amber) 12%, transparent)', color: 'var(--accent-amber)', border: '1px solid color-mix(in srgb, var(--accent-amber) 20%, transparent)' }}
          >
            <Plus className="h-4 w-4" />
            <span>List Property</span>
          </button>

          {/* Theme toggle */}
          <button onClick={onToggleTheme}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button onClick={onOpenChatDrawer}
            className="relative p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}>
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full ring-2 ring-black" style={{ background: 'var(--accent-green)' }} />
            )}
          </button>

          <button onClick={onOpenAccount}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}>
            <User className="h-5 w-5" />
          </button>
        </div>
        </div>
      </div>

      {/* Blinkit / Instamart Style Location Capsule Below Navbar */}
      <div className="relative w-full px-3 py-2 bg-transparent flex justify-center pointer-events-none">
        {/* Scroll Mask Behind Capsule */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] to-transparent opacity-90 -z-10" />
        <div
          onClick={onOpenCitySelector}
          className="w-full max-w-lg px-3 py-1.5 border border-[var(--border-subtle)] rounded-full backdrop-blur-md flex items-center justify-between text-[11px] cursor-pointer transition-all shadow-sm pointer-events-auto"
          style={{ background: 'var(--glass-bg)' }}
        >
          <div className="flex items-center gap-1.5 min-w-0 max-w-[75%] sm:max-w-md">
            <MapPin className="h-3 w-3 shrink-0 text-emerald-500" />
            <div className="flex items-center gap-1 truncate">
              <span className="font-extrabold tracking-tight text-[var(--text-primary)]">
                {currentCity ? currentCity.name.split(' (')[0] : 'Locating...'}
              </span>
              <span className="text-[var(--text-tertiary)]">·</span>
              <span className="font-semibold text-[var(--accent)] truncate">
                {currentCity?.defaultHub || 'Lalpur Chowk Hub'}
              </span>
              <span className="text-[9px] text-[var(--text-tertiary)] shrink-0 ml-0.5">▼</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 pl-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500/90 hidden sm:inline">Active (±10m)</span>
            <span className="text-[10px] font-bold text-emerald-500/90 sm:hidden">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
