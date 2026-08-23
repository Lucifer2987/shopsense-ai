'use client';

import React, { useState } from 'react';
import { ShoppingBag, Mic, Sun, Moon, Search, X, MapPin, ChevronDown, User } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function Header({ searchValue, onSearchChange }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { itemCount, subtotal, setIsCartOpen, setIsVoiceModalOpen } = useApp();
  const [deliveryLocation, setDeliveryLocation] = useState('Home · 2nd Main, Indiranagar');

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/95 backdrop-blur-md transition-colors shadow-2xs">
      
      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2.5 sm:gap-6">
        
        {/* Left: Brand + Delivery Location */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {/* Brand Mark */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-xs group-hover:bg-emerald-700 transition-colors">
              S
            </div>
            <div className="hidden min-[380px]:block">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[var(--text-primary)] block leading-none">
                ShopSense
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                Instant Grocery
              </span>
            </div>
          </a>

          {/* Delivery Location Context (Instamart style) */}
          <div className="hidden lg:flex flex-col text-left pl-3 border-l border-[var(--border-subtle)]">
            <div className="flex items-center gap-1 text-[11px] font-black text-emerald-700 dark:text-emerald-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>12 MINS DELIVERY</span>
            </div>
            <button
              onClick={() => {
                const loc = prompt('Enter your delivery address:', deliveryLocation);
                if (loc?.trim()) setDeliveryLocation(loc.trim());
              }}
              className="flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-left truncate max-w-[200px]"
            >
              <span className="truncate">{deliveryLocation}</span>
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
            </button>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for &ldquo;milk&rdquo;, &ldquo;bread&rdquo;, &ldquo;apples&rdquo;, &ldquo;chips&rdquo;..."
              className="w-full pl-10 pr-16 sm:pr-20 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
            
            <div className="absolute right-2 flex items-center gap-1">
              {searchValue && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Integrated Search Mic Button */}
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-semibold text-xs transition-colors border border-emerald-500/20"
                title="Search by voice"
                aria-label="Search by voice"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline text-[11px]">Voice</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Account, Theme & Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Sign in / Profile indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer">
            <User className="w-4 h-4 text-[var(--text-muted)]" />
            <span>Account</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Primary Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0"
            aria-label={`Open cart with ${itemCount} items`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="font-extrabold">
              {itemCount > 0 ? `₹${subtotal.toFixed(0)}` : 'Cart'}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
}
