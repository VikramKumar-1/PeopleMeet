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
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* Mobile: Compact Floating Pill */}
      <div className="md:hidden fixed bottom-2 left-0 right-0 pointer-events-none flex justify-center px-4">
        <div
          className="w-full max-w-sm flex items-center justify-around rounded-xl border border-[var(--glass-border)] shadow-lg px-1 py-1 backdrop-blur-md pointer-events-auto"
          style={{ background: 'var(--glass-bg)' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className="relative flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-all active:scale-95"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomTabPill"
                    className="absolute inset-0 bg-[var(--bg-elevated)] rounded-lg opacity-90 border border-[var(--border-subtle)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon
                  className={`relative z-10 h-4 w-4 transition-colors ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className={`relative z-10 text-[9px] font-bold tracking-tight transition-colors ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Clean Flat Tab Bar */}
      <div className="hidden md:block bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] pointer-events-auto">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-1 px-4 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktopTabPill"
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
    </nav>
  );
}
