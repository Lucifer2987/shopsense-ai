'use client';

import React from 'react';
import { ShoppingBag, Mic, Sun, Moon, Search, X, MapPin } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function Header({ searchValue, onSearchChange }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { itemCount, subtotal, setIsCartOpen, setIsVoiceModalOpen } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/95 backdrop-blur-md transition-colors">
      
      {/* Top Utility Bar (Delivery Context) */}
      <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 lg:px-8 py-1.5 bg-[var(--bg-card-subtle)] border-b border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5 font-medium">
          <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Delivering fresh groceries in <strong className="text-[var(--text-primary)]">15 mins</strong></span>
        </div>
        <div className="flex items-center gap-4 text-[var(--text-muted)]">
          <span>Daily 7 AM – 11 PM</span>
          <span>•</span>
          <span>Free delivery above ₹199</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
            S
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-[var(--text-primary)] block leading-none">
              ShopSense
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
              Fresh Grocery
            </span>
          </div>
        </a>

        {/* E-Commerce Search Bar with Voice Companion */}
        <div className="flex-1 max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search milk, bread, apples, snacks, oil..."
              className="w-full pl-10 pr-20 py-2.5 rounded-xl text-sm bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
            
            <div className="absolute right-2 flex items-center gap-1">
              {searchValue && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Integrated Search Mic Shortcut */}
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-medium text-xs transition-colors border border-emerald-500/20"
                title="Search or add by voice"
                aria-label="Voice shopping assistant"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline font-semibold text-[11px]">Voice</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Navigation & Basket */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
            aria-label="Toggle light/dark theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Basket Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
            aria-label={`Shopping cart with ${itemCount} items`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">
              {itemCount > 0 ? `₹${subtotal.toFixed(0)}` : 'Cart'}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
}
