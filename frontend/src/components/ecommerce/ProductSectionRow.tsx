'use client';

import React, { useRef } from 'react';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSectionRowProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onSeeAll?: () => void;
}

export function ProductSectionRow({
  title,
  subtitle,
  products,
  onSeeAll,
}: ProductSectionRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="my-4 sm:my-6 relative group/section">
      {/* Section Header (Reference Style: Title on left, See All on right) */}
      <div className="flex items-end justify-between mb-2.5 sm:mb-3 px-1">
        <div>
          <h2 className="font-extrabold text-base sm:text-lg lg:text-xl text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline flex items-center gap-0.5 transition-colors"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative">
        
        {/* Desktop Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-md items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] opacity-0 group-hover/section:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Products Row */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-2.5 sm:gap-4 overflow-x-auto pb-2 pt-0.5 px-0.5 scrollbar-none scroll-smooth -mx-1 sm:mx-0 px-1 sm:px-0"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[145px] sm:w-[180px] lg:w-[200px] shrink-0 flex"
            >
              <div className="w-full">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-md items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] opacity-0 group-hover/section:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </section>
  );
}
