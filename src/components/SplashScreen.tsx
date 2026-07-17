'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simulate loading progress
    const duration = 1200; // 1.2 seconds total loading time
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = (currentStep / steps) * 100;
      
      // Add slight easing to the progress calculation for a natural feel
      const easeOutProgress = 100 * (1 - Math.pow(1 - currentProgress / 100, 3));
      
      setProgress(Math.min(easeOutProgress, 100));

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          setIsVisible(false);
          if (onFinish) onFinish();
        }, 400); // Wait a tiny bit at 100% before fading out
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#090c15] overflow-hidden"
        >
          {/* Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center relative z-10 w-full max-w-xs px-6"
          >
            {/* Logo / Brand Name */}
            <div className="relative mb-8">
              <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                WeMate
              </h1>
              <motion.div 
                className="absolute -top-1 -right-3 text-2xl"
                initial={{ rotate: -45, scale: 0 }}
                animate={{ rotate: 15, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                ✨
              </motion.div>
            </div>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-slate-400 text-sm font-semibold tracking-widest uppercase mb-12"
            >
              Connecting Peers
            </motion.p>

            {/* Progress Bar Container */}
            <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden shadow-inner backdrop-blur-sm border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                {/* Glowing tip on the progress bar */}
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-[2px] rounded-full" />
              </motion.div>
            </div>

            {/* Percentage Text */}
            <div className="mt-4 text-xs font-bold text-slate-500 tabular-nums tracking-widest">
              {Math.round(progress)}%
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
