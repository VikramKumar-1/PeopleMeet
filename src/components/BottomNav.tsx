'use client';

import React from 'react';
import { ScanSearch, BedDouble, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabType = 'radar' | 'stay' | 'tiffin';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'radar', label: 'Find Near People', icon: ScanSearch },
  { id: 'stay', label: 'Stay', icon: BedDouble },
  { id: 'tiffin', label: 'Tiffin/Mess', icon: UtensilsCrossed },
];

export default function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Mobile: Floating pill */}
      <div className="md:hidden mx-3 mb-3">
        <div className="flex items-center justify-around bg-[var(--bg-card-solid)]/95 backdrop-blur-2xl rounded-2xl border border-[var(--border-subtle)] shadow-[var(--shadow-elevated)] px-2 py-2 pb-safe">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => onChangeTab(tab.id)}
                className="relative flex flex-col items-center justify-center w-20 py-1.5 rounded-xl transition-all active:scale-90">
                {isActive && (
                  <motion.div layoutId="bottomTabPill"
                    className="absolute inset-0 bg-[var(--bg-elevated)] rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                )}
                <Icon className={`relative z-10 h-[22px] w-[22px] transition-colors ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`}
                  strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`relative z-10 text-[11px] mt-1 font-semibold tracking-wide transition-colors ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Clean flat tab bar */}
      <div className="hidden md:block bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-1 px-4 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => onChangeTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}>
                {isActive && (
                  <motion.div layoutId="desktopTabPill"
                    className="absolute inset-0 bg-[var(--bg-elevated)] rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                )}
                <Icon className={`relative z-10 h-[18px] w-[18px] ${isActive ? 'text-[var(--accent)]' : ''}`} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
