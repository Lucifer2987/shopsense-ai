'use client';

import React from 'react';
import { Store, Mic, ShoppingBag, Sparkles, Layers } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface MobileNavProps {
  activeTab: 'shop' | 'categories' | 'plan';
  onTabChange: (tab: 'shop' | 'categories' | 'plan') => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const { itemCount, subtotal, setIsCartOpen, setIsVoiceModalOpen, activeContext } = useApp();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] px-2 py-1 flex items-center justify-around shadow-lg"
      aria-label="Mobile Navigation"
    >
      {/* Shop Tab */}
      <button
        onClick={() => onTabChange('shop')}
        className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center p-1 text-[11px] font-semibold transition-colors ${
          activeTab === 'shop'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Store className="w-5 h-5" />
        <span>Shop</span>
      </button>

      {/* Categories Tab */}
      <button
        onClick={() => onTabChange('categories')}
        className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center p-1 text-[11px] font-semibold transition-colors ${
          activeTab === 'categories'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Layers className="w-5 h-5" />
        <span>Categories</span>
      </button>

      {/* Center Thumb Mic Button */}
      <div className="-mt-4">
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="w-13 h-13 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
          aria-label="Voice shopping assistant"
        >
          <Mic className="w-6 h-6" />
        </button>
      </div>

      {/* Shopping Plan / Context Tab */}
      <button
        onClick={() => onTabChange('plan')}
        className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center p-1 text-[11px] font-semibold relative transition-colors ${
          activeTab === 'plan'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Sparkles className="w-5 h-5" />
        <span>Plan</span>
        {activeContext && (
          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-emerald-500" />
        )}
      </button>

      {/* Basket Tab */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center p-1 text-[11px] font-semibold relative text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        aria-label={`Cart with ${itemCount} items`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        <span>{itemCount > 0 ? `₹${subtotal.toFixed(0)}` : 'Cart'}</span>
      </button>
    </nav>
  );
}
