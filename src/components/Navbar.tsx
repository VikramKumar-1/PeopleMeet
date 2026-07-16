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
        {/* Left: Logo + City */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Stay<span style={{ color: 'var(--accent)' }}>&amp;</span>Dine
          </span>

          <button
            onClick={onOpenCitySelector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors animate-pulse"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <MapPin className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
            <span>{currentCity ? currentCity.name.split(' (')[0] : 'Detecting City...'}</span>
            <span style={{ color: 'var(--text-tertiary)' }} className="text-xs">▼</span>
          </button>
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
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />
            )}
          </button>

          <button onClick={onOpenAccount}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}>
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
