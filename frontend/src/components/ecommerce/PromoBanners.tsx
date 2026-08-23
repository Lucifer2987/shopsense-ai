'use client';

import React from 'react';
import { ArrowRight, Zap, ShieldCheck } from 'lucide-react';

interface PromoBannersProps {
  onCategorySelect?: (category: string) => void;
}

export function PromoBanners({ onCategorySelect }: PromoBannersProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 my-3">
      {/* Banner 1: Everyday Low Prices & Free Delivery */}
      <div 
        onClick={() => onCategorySelect?.('Dairy')}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white p-4 sm:p-6 flex flex-col justify-between min-h-[140px] sm:min-h-[160px] cursor-pointer shadow-xs hover:shadow-md transition-all duration-200"
      >
        <div className="relative z-10 max-w-[70%]">
          <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md text-emerald-100 mb-2">
            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
            EVERYDAY LOW PRICES
          </div>
          <h3 className="font-black text-lg sm:text-xl leading-tight tracking-tight">
            Fresh Milk, Bread & Daily Staples
          </h3>
          <p className="text-xs text-emerald-100/90 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>₹0 Delivery Fee on orders above ₹199</span>
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-emerald-200 group-hover:text-white transition-colors mt-3">
          <span>Shop Essentials</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>

        <span className="absolute -right-3 -bottom-3 text-6xl sm:text-7xl opacity-30 select-none transition-transform group-hover:scale-110 duration-300">
          🥛
        </span>
      </div>

      {/* Banner 2: Drinks & Munchies */}
      <div 
        onClick={() => onCategorySelect?.('Snacks')}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white p-4 sm:p-6 flex flex-col justify-between min-h-[140px] sm:min-h-[160px] cursor-pointer shadow-xs hover:shadow-md transition-all duration-200"
      >
        <div className="relative z-10 max-w-[70%]">
          <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md text-amber-100 mb-2">
            <Zap className="w-3 h-3 text-yellow-200 fill-yellow-200" />
            CHILL & REFRESH
          </div>
          <h3 className="font-black text-lg sm:text-xl leading-tight tracking-tight">
            Chips, Dips & Cold Beverages
          </h3>
          <p className="text-xs text-amber-100/90 mt-1">
            Party snacks & refreshments delivered in 12 mins
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-amber-200 group-hover:text-white transition-colors mt-3">
          <span>Explore Snacks</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>

        <span className="absolute -right-3 -bottom-3 text-6xl sm:text-7xl opacity-30 select-none transition-transform group-hover:scale-110 duration-300">
          🍿
        </span>
      </div>
    </section>
  );
}
