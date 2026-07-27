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
    <header className="sticky top-0 z-40 w-full flex flex-col pointer-events-none">
      {/* Main Single-Row Sleek Navbar */}
      <div
        className="w-full pointer-events-auto border-b border-[var(--border-subtle)] shadow-sm"
        style={{ background: 'var(--glass-bg)', backdropFilter: `blur(var(--glass-blur))`, WebkitBackdropFilter: `blur(var(--glass-blur))` }}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-4 h-13 sm:h-14 flex items-center justify-between gap-2">
          {/* Left: Logo + Inline Location Selector */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1 shrink-0" style={{ color: 'var(--text-primary)' }}>
              We<span style={{ color: 'var(--accent)' }}>Mate</span>✨
            </span>

            {/* Compact Location Pill */}
            <button
              onClick={onOpenCitySelector}
              className="px-2.5 py-1 border border-[var(--border-subtle)] rounded-full bg-[var(--bg-elevated)]/60 hover:bg-[var(--bg-card)] flex items-center gap-1 text-[11px] transition-all shadow-xs truncate max-w-[130px] sm:max-w-[220px]"
              title="Change City or Hub"
            >
              <MapPin className="h-3 w-3 shrink-0 text-emerald-500" />
              <span className="font-extrabold text-[var(--text-primary)] truncate">
                {currentCity ? currentCity.name.split(' (')[0] : 'Locating...'}
              </span>
              <span className="text-[var(--text-tertiary)] hidden sm:inline">·</span>
              <span className="font-semibold text-[var(--accent)] truncate hidden sm:inline">
                {currentCity?.defaultHub || 'Hub'}
              </span>
              <span className="text-[8px] text-[var(--text-tertiary)] shrink-0 ml-0.5">▼</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onOpenListProperty}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: 'color-mix(in srgb, var(--accent-amber) 12%, transparent)', color: 'var(--accent-amber)', border: '1px solid color-mix(in srgb, var(--accent-amber) 20%, transparent)' }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>List Property</span>
            </button>

            {/* Theme toggle */}
            <button onClick={onToggleTheme}
              className="p-1.5 sm:p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <button onClick={onOpenChatDrawer}
              className="relative p-1.5 sm:p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}>
              <MessageCircle className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full ring-2 ring-black" style={{ background: 'var(--accent-green)' }} />
              )}
            </button>

            <button onClick={onOpenAccount}
              className="p-1.5 sm:p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}>
              <User className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
