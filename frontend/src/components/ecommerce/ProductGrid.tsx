'use client';

import React from 'react';
import { Product, SortOption } from '@/types/product';
import { ProductCard } from './ProductCard';
import { ArrowUpDown, PackageSearch, Filter } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onResetFilters: () => void;
  onToggleMobileFilters?: () => void;
}

export function ProductGrid({
  products,
  loading,
  error,
  sortBy,
  onSortChange,
  onResetFilters,
  onToggleMobileFilters,
}: ProductGridProps) {
  if (error) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <PackageSearch className="w-12 h-12 mx-auto text-red-500/70 mb-3" />
        <h4 className="text-base font-semibold text-[var(--text-primary)]">
          Could not load grocery items
        </h4>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
          {error}
        </p>
        <button
          onClick={onResetFilters}
          className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      
      {/* Grid Controls Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onToggleMobileFilters && (
            <button
              onClick={onToggleMobileFilters}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          )}
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            {loading ? 'Fetching catalog...' : `${products.length} products available`}
          </span>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs shadow-2xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer text-xs"
            aria-label="Sort products"
          >
            <option value="default" className="bg-[var(--bg-card)]">Featured</option>
            <option value="price-asc" className="bg-[var(--bg-card)]">Price: Low to High</option>
            <option value="price-desc" className="bg-[var(--bg-card)]">Price: High to Low</option>
            <option value="name-asc" className="bg-[var(--bg-card)]">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Grid Items */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-3.5 space-y-3 animate-pulse"
            >
              <div className="w-full aspect-square bg-[var(--bg-card-subtle)] rounded-xl" />
              <div className="h-4 bg-[var(--bg-card-subtle)] rounded-md w-3/4" />
              <div className="h-3 bg-[var(--bg-card-subtle)] rounded-md w-1/2" />
              <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center">
                <div className="h-5 bg-[var(--bg-card-subtle)] rounded-md w-10" />
                <div className="h-8 bg-[var(--bg-card-subtle)] rounded-xl w-14" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs">
          <PackageSearch className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
          <h4 className="text-base font-bold text-[var(--text-primary)]">
            No grocery items match your search
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Try searching for common staples like milk, bread, butter, or clear existing filters.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
