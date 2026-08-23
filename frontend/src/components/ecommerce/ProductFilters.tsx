'use client';

import React from 'react';
import { ProductFilters as FilterType } from '@/types/product';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface ProductFiltersProps {
  filters: FilterType;
  brands: string[];
  onUpdateFilters: (filters: Partial<FilterType>) => void;
  onResetFilters: () => void;
}

export function ProductFilters({
  filters,
  brands,
  onUpdateFilters,
  onResetFilters,
}: ProductFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.brand ||
    filters.max_price ||
    filters.min_price ||
    filters.in_stock
  );

  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 space-y-4 shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-emerald-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Max Price Range Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-2">
          <span>Max Price</span>
          <span className="font-extrabold text-[var(--text-primary)]">
            {filters.max_price ? `₹${filters.max_price}` : 'Up to ₹300+'}
          </span>
        </div>
        <input
          type="range"
          min="50"
          max="300"
          step="10"
          value={filters.max_price || 300}
          onChange={(e) => {
            const val = Number(e.target.value);
            onUpdateFilters({ max_price: val < 300 ? val : undefined });
          }}
          className="w-full accent-emerald-600 h-1.5 bg-[var(--border-subtle)] rounded-lg cursor-pointer"
          aria-label="Filter by maximum price"
        />
        <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-medium mt-1">
          <span>₹50</span>
          <span>₹175</span>
          <span>₹300+</span>
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="pt-3 border-t border-[var(--border-subtle)]">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            In Stock Items Only
          </span>
          <input
            type="checkbox"
            checked={Boolean(filters.in_stock)}
            onChange={(e) => onUpdateFilters({ in_stock: e.target.checked || undefined })}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-[var(--border-strong)] accent-emerald-600 cursor-pointer"
          />
        </label>
      </div>

      {/* Brand Selection */}
      {brands.length > 0 && (
        <div className="pt-3 border-t border-[var(--border-subtle)]">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Brands
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
            {brands.map(brand => {
              const isSelected = filters.brand === brand;
              return (
                <button
                  key={brand}
                  onClick={() => onUpdateFilters({ brand: isSelected ? undefined : brand })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                      : 'bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
