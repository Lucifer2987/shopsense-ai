'use client';

import React from 'react';

const CATEGORY_META: Record<string, { icon: string; label: string }> = {
  All: { icon: '🛒', label: 'All Items' },
  Dairy: { icon: '🥛', label: 'Dairy' },
  'Dairy Alternative': { icon: '🌱', label: 'Plant-Based' },
  Bakery: { icon: '🍞', label: 'Bakery' },
  Fruits: { icon: '🍎', label: 'Fresh Fruits' },
  Vegetables: { icon: '🥦', label: 'Vegetables' },
  Snacks: { icon: '🍿', label: 'Snacks & Dips' },
  Beverages: { icon: '🥤', label: 'Drinks & Juices' },
  Breakfast: { icon: '🥣', label: 'Breakfast' },
  Pantry: { icon: '🧂', label: 'Pantry' },
};

interface CategoryNavProps {
  categories: string[];
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryNav({
  categories,
  selectedCategory = 'All',
  onSelectCategory,
}: CategoryNavProps) {
  const allCategories = ['All', ...categories.filter(c => c !== 'All')];

  return (
    <nav className="w-full border-b border-[var(--border-subtle)] pb-2 overflow-x-auto scrollbar-none" aria-label="Grocery categories">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max px-0.5">
        {allCategories.map(cat => {
          const isSelected = selectedCategory === cat || (!selectedCategory && cat === 'All');
          const meta = CATEGORY_META[cat] || { icon: '📦', label: cat };

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat === 'All' ? '' : cat)}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
              }`}
            >
              <span className="text-base select-none">{meta.icon}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
