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
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] pt-safe"
      style={{ background: 'var(--glass-bg)', backdropFilter: `blur(var(--glass-blur))`, WebkitBackdropFilter: `blur(var(--glass-blur))` }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-black tracking-tight flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
            Stay<span style={{ color: 'var(--accent)' }}>&amp;</span>Dine
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

      {/* Blinkit / Instamart Style Location & Accuracy Bar Below Navbar */}
      <div
        onClick={onOpenCitySelector}
        className="w-full px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/90 flex items-center justify-between text-xs cursor-pointer hover:bg-[var(--bg-surface)] transition-all shadow-inner"
      >
        <div className="flex items-center gap-2 min-w-0 max-w-[75%] sm:max-w-md">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500 animate-bounce" />
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-extrabold tracking-tight text-[var(--text-primary)]">
              {currentCity ? currentCity.name.split(' (')[0] : 'Locating...'}
            </span>
            <span className="text-[var(--text-tertiary)]">·</span>
            <span className="font-semibold text-[var(--accent)] truncate">
              {currentCity?.defaultHub || 'Lalpur Chowk Hub'}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">▼</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-500 hidden sm:inline">Active Proximity (±10m)</span>
          <span className="text-[11px] font-bold text-emerald-500 sm:hidden">Live Accuracy</span>
        </div>
      </div>
    </header>
  );
}
