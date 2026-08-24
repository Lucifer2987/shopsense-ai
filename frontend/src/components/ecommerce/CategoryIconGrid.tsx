'use client';

import React from 'react';

const CATEGORY_ITEMS = [
  { id: 'Fruits', name: 'Fruits & Vegetables', emoji: '🍎', bg: 'bg-emerald-500/10' },
  { id: 'Dairy', name: 'Dairy, Bread & Eggs', emoji: '🥛', bg: 'bg-blue-500/10' },
  { id: 'Snacks', name: 'Snacks & Munchies', emoji: '🍿', bg: 'bg-amber-500/10' },
  { id: 'Beverages', name: 'Cold Drinks & Juices', emoji: '🥤', bg: 'bg-red-500/10' },
  { id: 'Bakery', name: 'Fresh Bakery & Buns', emoji: '🍞', bg: 'bg-orange-500/10' },
  { id: 'Breakfast', name: 'Breakfast & Cereals', emoji: '🥣', bg: 'bg-yellow-500/10' },
  { id: 'Pantry', name: 'Atta, Rice & Dals', emoji: '🌾', bg: 'bg-stone-500/10' },
  { id: 'Dairy Alternative', name: 'Plant-Based Milk', emoji: '🌱', bg: 'bg-teal-500/10' },
];

interface CategoryIconGridProps {
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryIconGrid({
  selectedCategory = 'All',
  onSelectCategory,
}: CategoryIconGridProps) {
  return (
    <section className="my-2.5 sm:my-4" aria-label="Browse by category">
      <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none px-0.5 sm:px-1">
        {CATEGORY_ITEMS.map((item) => {
          const isSelected = selectedCategory === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory(isSelected ? '' : item.id)}
              className={`flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2.5 rounded-2xl transition-all duration-150 shrink-0 w-[72px] sm:w-[86px] lg:w-[94px] text-center group ${
                isSelected
                  ? 'bg-emerald-600/10 border-2 border-emerald-600 scale-[1.02]'
                  : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40 hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${item.bg} flex items-center justify-center text-xl sm:text-2xl select-none group-hover:scale-110 transition-transform`}>
                {item.emoji}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-2 ${
                isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-[var(--text-secondary)]'
              }`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
