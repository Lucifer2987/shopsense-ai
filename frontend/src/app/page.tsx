'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { CategoryIconGrid } from '@/components/ecommerce/CategoryIconGrid';
import { PromoBanners } from '@/components/ecommerce/PromoBanners';
import { ProductSectionRow } from '@/components/ecommerce/ProductSectionRow';
import { ProductFilters } from '@/components/ecommerce/ProductFilters';
import { ProductGrid } from '@/components/ecommerce/ProductGrid';
import { ContextShoppingStrip } from '@/components/context/ContextShoppingStrip';
import { FloatingVoiceAssistant } from '@/components/voice/FloatingVoiceAssistant';
import { ShoppingListDrawer } from '@/components/shopping/ShoppingListDrawer';
import { BasketOptimizerModal } from '@/components/shopping/BasketOptimizerModal';
import { useProducts } from '@/hooks/useProducts';
import { useApp } from '@/context/AppContext';
import { X, SlidersHorizontal, ArrowLeft } from 'lucide-react';

export default function HomePage() {
  const [mobileTab, setMobileTab] = useState<'shop' | 'categories' | 'plan'>('shop');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const {
    products,
    rawProducts,
    loading,
    error,
    filters,
    sortBy,
    setSortBy,
    updateFilters,
    resetFilters,
    brands,
  } = useProducts();

  const { setIsVoiceModalOpen } = useApp();

  // Categorize products for horizontal shelves
  const shelfCategories = useMemo(() => {
    const dairy = rawProducts.filter(p => p.category?.toLowerCase().includes('dairy') || p.name.toLowerCase().includes('milk') || p.name.toLowerCase().includes('bread') || p.name.toLowerCase().includes('egg'));
    const fruits = rawProducts.filter(p => p.category?.toLowerCase().includes('fruit') || p.category?.toLowerCase().includes('veg'));
    const snacks = rawProducts.filter(p => p.category?.toLowerCase().includes('snack') || p.category?.toLowerCase().includes('bev') || p.name.toLowerCase().includes('chip') || p.name.toLowerCase().includes('cola'));
    const breakfast = rawProducts.filter(p => p.category?.toLowerCase().includes('breakfast') || p.category?.toLowerCase().includes('bakery') || p.name.toLowerCase().includes('oat') || p.name.toLowerCase().includes('cereal'));

    return {
      dairy: dairy.length > 0 ? dairy : rawProducts.slice(0, 6),
      fruits: fruits.length > 0 ? fruits : rawProducts.slice(2, 8),
      snacks: snacks.length > 0 ? snacks : rawProducts.slice(4, 10),
      breakfast: breakfast.length > 0 ? breakfast : rawProducts.slice(1, 7),
    };
  }, [rawProducts]);

  const isFilteringOrSearching = !!filters.search || (!!filters.category && filters.category !== 'All');

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-12 bg-[var(--bg-page)] transition-colors">
      
      {/* 1. Header with Location, Search Bar and Cart */}
      <Header
        searchValue={filters.search || ''}
        onSearchChange={(val) => updateFilters({ search: val || undefined })}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
        
        {/* If user is searching or viewing a single category, show breadcrumb / clear filter bar */}
        {isFilteringOrSearching ? (
          <div className="space-y-4 pt-1">
            
            {/* Filter active banner */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <button
                  onClick={resetFilters}
                  className="p-1 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  aria-label="Back to home"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)]">
                  {filters.search ? `Search results for "${filters.search}"` : `${filters.category} Collection`}
                </h1>
                <span className="text-xs text-[var(--text-muted)]">
                  ({products.length} {products.length === 1 ? 'item' : 'items'})
                </span>
              </div>

              <button
                onClick={resetFilters}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>

            {/* Grid with Filter Sidebar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
              
              {/* Desktop Filter Sidebar */}
              <aside className="hidden md:block md:col-span-1 space-y-4">
                <div className="sticky top-20">
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
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                        <span className="font-extrabold text-sm text-[var(--text-primary)]">Filter Catalog</span>
                      </div>
                      <button
                        onClick={() => setMobileFilterOpen(false)}
                        className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        aria-label="Close filters"
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

              {/* Product Grid */}
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

          </div>
        ) : (
          /* Default Commerce Store Homepage */
          <div className="space-y-4">
            
            {/* 2. Category Icons Strip (Instamart / Zepto Style) */}
            <CategoryIconGrid
              selectedCategory={filters.category || 'All'}
              onSelectCategory={(cat) => updateFilters({ category: cat || undefined })}
            />

            {/* 3. Promotional Grocery Banners */}
            <PromoBanners onCategorySelect={(cat) => updateFilters({ category: cat })} />

            {/* 4. Context-Aware Event Shopping Strip (e.g. "Planning for 4 guests tomorrow") */}
            <ContextShoppingStrip />

            {/* 5. Horizontal Categorized Product Shelves (Zepto/Instamart Style) */}
            <ProductSectionRow
              title="Dairy, Bread & Eggs"
              subtitle="Fresh morning milk, bakery bread and daily essentials"
              products={shelfCategories.dairy}
              onSeeAll={() => updateFilters({ category: 'Dairy' })}
            />

            <ProductSectionRow
              title="Fresh Fruits & Vegetables"
              subtitle="Farm-picked seasonal produce and daily greens"
              products={shelfCategories.fruits}
              onSeeAll={() => updateFilters({ category: 'Fruits' })}
            />

            <ProductSectionRow
              title="Snacks & Cold Beverages"
              subtitle="Chips, dips, juices & party munchies"
              products={shelfCategories.snacks}
              onSeeAll={() => updateFilters({ category: 'Snacks' })}
            />

            <ProductSectionRow
              title="Breakfast Essentials"
              subtitle="Cereals, oats, spreads & morning quick bites"
              products={shelfCategories.breakfast}
              onSeeAll={() => updateFilters({ category: 'Breakfast' })}
            />

          </div>
        )}

      </main>

      {/* Floating Bottom-Right Voice Assistant (Desktop & Mobile) */}
      <FloatingVoiceAssistant />

      {/* Cart Slide-over Drawer */}
      <ShoppingListDrawer />

      {/* Basket Optimizer Modal */}
      <BasketOptimizerModal />

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={mobileTab}
        onTabChange={(tab) => {
          setMobileTab(tab);
          if (tab === 'categories') {
            window.scrollTo({ top: 40, behavior: 'smooth' });
          } else if (tab === 'plan') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

    </div>
  );
}
