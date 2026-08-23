'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { CategoryNav } from '@/components/ecommerce/CategoryNav';
import { ProductFilters } from '@/components/ecommerce/ProductFilters';
import { ProductGrid } from '@/components/ecommerce/ProductGrid';
import { RecommendationsSection } from '@/components/recommendations/RecommendationsSection';
import { ContextBanner } from '@/components/context/ContextBanner';
import { VoiceAssistantModal } from '@/components/voice/VoiceAssistantModal';
import { VoiceFloatingButton } from '@/components/voice/VoiceFloatingButton';
import { ShoppingListDrawer } from '@/components/shopping/ShoppingListDrawer';
import { BasketOptimizerModal } from '@/components/shopping/BasketOptimizerModal';
import { useProducts } from '@/hooks/useProducts';
import { useApp } from '@/context/AppContext';
import { Mic, X } from 'lucide-react';

export default function HomePage() {
  const [mobileTab, setMobileTab] = useState<'shop' | 'categories' | 'plan'>('shop');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const {
    products,
    loading,
    error,
    filters,
    sortBy,
    setSortBy,
    updateFilters,
    resetFilters,
    categories,
    brands,
  } = useProducts();

  const { setIsVoiceModalOpen } = useApp();

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-8 bg-[var(--bg-page)]">
      
      {/* Primary E-Commerce Header */}
      <Header
        searchValue={filters.search || ''}
        onSearchChange={(val) => updateFilters({ search: val || undefined })}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Context / Goal Plan Banner */}
        <ContextBanner />

        {/* Compact Quick Voice Shortcut Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              <strong className="text-[var(--text-primary)] font-semibold">Hands busy?</strong>{' '}
              Say &ldquo;bhai 2 litre doodh add kar de&rdquo; or &ldquo;apples under 200&rdquo;
            </p>
          </div>

          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-all shrink-0 ml-2"
          >
            <span>Speak</span>
          </button>
        </div>

        {/* Categories Bar */}
        <section aria-label="Product categories">
          <CategoryNav
            categories={categories}
            selectedCategory={filters.category || 'All'}
            onSelectCategory={(cat) => updateFilters({ category: cat || undefined })}
          />
        </section>

        {/* Personalized "Picked for You" Grocery Shelf */}
        <RecommendationsSection />

        {/* Main Product Catalog Section: Filters + Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 pt-1">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block md:col-span-1 space-y-4">
            <div className="sticky top-24">
              <ProductFilters
                filters={filters}
                brands={brands}
                onUpdateFilters={updateFilters}
                onResetFilters={resetFilters}
              />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-end">
              <div className="w-full bg-[var(--bg-card)] rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-150">
                <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)]">
                  <span className="font-extrabold text-sm text-[var(--text-primary)]">Filter Catalog</span>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <ProductFilters
                  filters={filters}
                  brands={brands}
                  onUpdateFilters={updateFilters}
                  onResetFilters={resetFilters}
                />
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Product Grid Area */}
          <section className="md:col-span-3">
            <ProductGrid
              products={products}
              loading={loading}
              error={error}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onResetFilters={resetFilters}
              onToggleMobileFilters={() => setMobileFilterOpen(true)}
            />
          </section>

        </div>

      </main>

      {/* Interactive Voice Assistant Modal */}
      <VoiceAssistantModal />

      {/* Floating Desktop Voice Trigger */}
      <VoiceFloatingButton />

      {/* Cart Drawer */}
      <ShoppingListDrawer />

      {/* Basket Optimizer Modal */}
      <BasketOptimizerModal />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={mobileTab}
        onTabChange={(tab) => {
          setMobileTab(tab);
          if (tab === 'categories') {
            window.scrollTo({ top: 120, behavior: 'smooth' });
          } else if (tab === 'plan') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

    </div>
  );
}
