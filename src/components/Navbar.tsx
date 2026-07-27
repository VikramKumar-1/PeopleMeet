'use client';

import React from 'react';
import { MapPin, MessageCircle, Plus, User, Sun, Moon, ScanSearch, BedDouble, UtensilsCrossed } from 'lucide-react';
import { CityHub } from '@/types';
import { TabType } from '@/components/BottomNav';
import { motion } from 'framer-motion';

interface NavbarProps {
  currentCity: CityHub | null;
  onOpenCitySelector: () => void;
  onOpenChatDrawer: () => void;
  onOpenListProperty: () => void;
  onOpenAccount: () => void;
  unreadCount?: number;
  isDark: boolean;
  onToggleTheme: () => void;
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'radar', label: 'Find Near People', icon: ScanSearch },
  { id: 'stay', label: 'Stay', icon: BedDouble },
  { id: 'tiffin', label: 'Tiffin/Mess', icon: UtensilsCrossed },
];

export default function Navbar({
  currentCity,
  onOpenCitySelector,
  onOpenChatDrawer,
  onOpenListProperty,
  onOpenAccount,
  unreadCount = 0,
  isDark,
  onToggleTheme,
  activeTab,
  onChangeTab,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full pt-safe flex flex-col pointer-events-none">
      {/* Main Top Navbar */}
      <div
        className="w-full pointer-events-auto border-b border-[var(--border-subtle)] shadow-sm"
        style={{ background: 'var(--glass-bg)', backdropFilter: `blur(var(--glass-blur))`, WebkitBackdropFilter: `blur(var(--glass-blur))` }}
      >
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

        {/* Top Navigation Tabs (Find Near People | Stay | Tiffin/Mess) */}
        <div className="max-w-3xl mx-auto flex items-center justify-around sm:justify-center gap-1 px-2 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="topTabPill"
                    className="absolute inset-0 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={`relative z-10 h-4 w-4 ${isActive ? 'text-[var(--accent)]' : ''}`} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Capsule */}
      <div className="relative w-full px-3 py-1.5 bg-transparent flex justify-center pointer-events-none">
        <div
          onClick={onOpenCitySelector}
          className="w-full max-w-lg px-3 py-1 border border-[var(--border-subtle)] rounded-full backdrop-blur-md flex items-center justify-between text-[11px] cursor-pointer transition-all shadow-sm pointer-events-auto"
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
            <span className="text-[10px] font-bold text-emerald-500/90">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
