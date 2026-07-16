'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ShieldCheck, QrCode, Sparkles, Plus, Building2, Utensils } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CityHub } from '@/types';

interface ListPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityHub;
  onSuccessListing: (newListingTitle: string, category: string) => void;
}

export default function ListPropertyModal({
  isOpen,
  onClose,
  currentCity,
  onSuccessListing,
}: ListPropertyModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<'Hostel/PG' | 'Flat' | 'Tiffin/Mess'>('Hostel/PG');
  const [title, setTitle] = useState('');
  const [rent, setRent] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.length < 6) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      onSuccessListing(title || 'New Premium Property', category);
      onClose();
      // Reset form
      setStep(1);
      setTitle('');
      setRent('');
      setPhone('');
      setWhatsapp('');
      setUtrNumber('');
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Sparkles className="h-5 w-5 animate-spin" style={{ animationDuration: '6s' }} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>List Property / Mess</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                    ₹500/month Prime
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Get #1 Featured Priority in {currentCity.name} ({currentCity.defaultHub}) + Verified Badge ⭐
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="grid grid-cols-3 gap-2 my-5">
            {[
              { num: 1, label: 'Select Category' },
              { num: 2, label: 'Property Details' },
              { num: 3, label: 'Instant UPI Checkout' },
            ].map((item) => (
              <div
                key={item.num}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  step === item.num
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                    : step > item.num
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-500 text-xs'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider">Step {item.num}</div>
                <div className="text-xs sm:text-sm font-medium truncate">{item.label}</div>
              </div>
            ))}
          </div>

          {/* STEP 1: Choose Category */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-300">
                Choose what you want to feature right at the top:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Hostel/PG', label: 'Hostel / PG', icon: Building2, desc: 'Boys, Girls, or Co-ed PGs' },
                  { id: 'Flat', label: 'Flat / Room', icon: Building2, desc: '1BHK, 2BHK, 3BHK Independent' },
                  { id: 'Tiffin/Mess', label: 'Tiffin / Mess', icon: Utensils, desc: 'Daily Thali & Monthly Plans' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as any)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      category === cat.id
                        ? 'bg-gradient-to-tr from-amber-500/20 to-orange-600/20 border-amber-500 shadow-md text-white'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <cat.icon className={`h-6 w-6 mb-3 ${category === cat.id ? 'text-amber-400' : 'text-slate-500'}`} />
                    <div>
                      <h4 className="font-bold text-sm text-white">{cat.label}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3 text-xs text-cyan-200">
                <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Why PG/Mess Owners pay ₹500/month:</strong> A single tenant pays ₹6,000 to ₹12,000 rent/thali. Our 360° People Radar brings thousands of daily active students across {currentCity.name}, giving you instant 1,500% ROI!
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 font-bold text-white shadow-lg shadow-amber-500/20 transition-all text-sm sm:text-base"
              >
                Next: Enter Property Details →
              </button>
            </div>
          )}

          {/* STEP 2: Property Details */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Property / Mess Name
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Royal Heritage AC Boys PG / Maa Annapurna Tiffin"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {category === 'Tiffin/Mess' ? 'Single Thali Price (₹)' : 'Monthly Rent (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    placeholder={category === 'Tiffin/Mess' ? '70' : '6500'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    City & Hub
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${currentCity.name} (${currentCity.defaultHub})`}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-cyan-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98350XXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    WhatsApp Number (For Direct Orders)
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="9198350XXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-300 text-sm"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!title || !phone}
                  onClick={() => setStep(3)}
                  className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 font-bold text-white shadow-lg shadow-amber-500/20 text-sm disabled:opacity-50"
                >
                  Proceed to ₹500 UPI QR →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Instant UPI Checkout Modal */}
          {step === 3 && (
            <form onSubmit={handleSubmitPayment} className="space-y-4 text-center">
              <div className="p-4 rounded-3xl bg-slate-950 border border-amber-500/30 flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-extrabold uppercase tracking-wider mb-2">
                  <QrCode className="h-4 w-4 animate-pulse" /> Scan QR with GPay / PhonePe / Paytm
                </div>

                {/* Simulated UPI QR Box */}
                <div className="p-3 bg-white rounded-2xl shadow-xl my-2 border-4 border-amber-400 flex flex-col items-center justify-center w-48 h-48 text-black">
                  <div className="border-2 border-dashed border-slate-900 w-full h-full rounded-xl flex flex-col items-center justify-center p-2 text-center bg-slate-50">
                    <QrCode className="h-16 w-16 text-slate-900 mb-1" />
                    <div className="font-mono font-bold text-sm tracking-tighter text-slate-900">
                      stayanddine@okaxis
                    </div>
                    <div className="text-[10px] font-extrabold text-amber-600 mt-1 uppercase">
                      Amount: ₹500.00
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 font-medium mt-1">
                  Merchant: <span className="font-bold text-white">Stay & Dine Radar India</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle className="h-3 w-3" /> Instant Automated UTR Verification
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">
                  Enter 12-Digit UPI UTR / Transaction ID (Received after payment):
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 418290334812"
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-4 py-3 text-center font-mono text-base font-bold text-amber-300 focus:outline-none focus:border-amber-400 shadow-inner tracking-widest"
                  maxLength={16}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-300 text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !utrNumber || utrNumber.length < 6}
                  className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-bold text-white shadow-lg shadow-emerald-500/25 text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying UTR & Boosting...</span>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Verify & Go #1 Prime</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
