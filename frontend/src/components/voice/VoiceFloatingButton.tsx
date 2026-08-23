'use client';

import React from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function VoiceFloatingButton() {
  const { setIsVoiceModalOpen } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden md:block group">
      <button
        onClick={() => setIsVoiceModalOpen(true)}
        className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold text-sm shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Open voice shopping assistant"
      >
        <div className="relative">
          <Mic className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 animate-ping" />
        </div>
        <span className="font-bold tracking-tight">Talk to ShopSense</span>
      </button>
    </div>
  );
}
