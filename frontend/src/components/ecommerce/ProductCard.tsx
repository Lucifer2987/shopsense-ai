'use client';

import React from 'react';
import { Product } from '@/types/product';
import { useApp } from '@/context/AppContext';
import { Plus, Minus } from 'lucide-react';

const PRODUCT_EMOJIS: Record<string, string> = {
  milk: '🥛',
  'almond milk': '🌱',
  bread: '🍞',
  'brown bread': '🥖',
  eggs: '🥚',
  apples: '🍎',
  bananas: '🍌',
  oranges: '🍊',
  tomatoes: '🍅',
  potatoes: '🥔',
  cheese: '🧀',
  'peanut butter': '🥜',
  oats: '🥣',
  'corn flakes': '🌽',
  'potato chips': '🥔',
  'salsa dip': '🫙',
  cola: '🥤',
  'mineral water': '💧',
  'dark chocolate': '🍫',
};

export function getProductEmoji(name: string, category?: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(PRODUCT_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  if (category?.toLowerCase().includes('dairy')) return '🥛';
  if (category?.toLowerCase().includes('fruit')) return '🍎';
  if (category?.toLowerCase().includes('vegetable')) return '🥦';
  if (category?.toLowerCase().includes('snack')) return '🍿';
  if (category?.toLowerCase().includes('beverage')) return '🥤';
  if (category?.toLowerCase().includes('bakery')) return '🍞';
  return '📦';
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { list, addItem, updateItemQuantity } = useApp();

  const isAvailable = product.stock === true || (typeof product.stock === 'number' && product.stock > 0);
  const emoji = getProductEmoji(product.name, product.category);

  // Check if item is in shopping list
  const existingItem = list?.shopping_items?.find(
    item => item.product_id === product.id || item.products?.id === product.id
  );
  const currentQuantity = existingItem?.quantity || 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-600/40 p-3 sm:p-4 transition-all duration-150 shadow-xs hover:shadow-md">
      
      <div>
        {/* Product Image Area */}
        <div className="relative w-full aspect-square max-h-36 sm:max-h-40 rounded-xl bg-[var(--bg-card-subtle)] flex items-center justify-center mb-3 overflow-hidden border border-[var(--border-subtle)]">
          <span className="text-4xl sm:text-5xl filter drop-shadow-xs select-none transition-transform group-hover:scale-105 duration-200">
            {emoji}
          </span>
          
          {/* Subtle Brand Pill */}
          {product.brand && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[var(--bg-card)]/90 text-[var(--text-secondary)] border border-[var(--border-subtle)] shadow-2xs">
              {product.brand}
            </span>
          )}

          {/* Out of Stock Note Only */}
          {!isAvailable && (
            <span className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
              Out of stock
            </span>
          )}
        </div>

        {/* Brand & Unit */}
        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1">
          <span className="truncate max-w-[65%]">{product.brand || product.category}</span>
          <span className="font-medium">{product.unit || '1 unit'}</span>
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] line-clamp-2 leading-snug mb-1" title={product.name}>
          {product.name}
        </h3>
      </div>

      {/* Price & Action Section */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
        <div>
          <span className="text-sm sm:text-base font-black text-[var(--text-primary)] block leading-none">
            ₹{product.price.toFixed(0)}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
            incl. taxes
          </span>
        </div>

        {/* Fast Add / Stepper Control */}
        {currentQuantity > 0 ? (
          <div className="flex items-center gap-1 bg-emerald-600 rounded-xl p-0.5 text-white shadow-xs">
            <button
              onClick={() => updateItemQuantity(existingItem!.id, currentQuantity - 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center font-bold transition-colors"
              aria-label={`Decrease ${product.name} quantity`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-5 text-center font-bold text-xs sm:text-sm">
              {currentQuantity}
            </span>
            <button
              onClick={() => updateItemQuantity(existingItem!.id, currentQuantity + 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center font-bold transition-colors"
              aria-label={`Increase ${product.name} quantity`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addItem(product, 1)}
            disabled={!isAvailable}
            className={`min-h-[36px] sm:min-h-[40px] px-3.5 sm:px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white active:scale-95'
                : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-subtle)]'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        )}
      </div>

    </div>
  );
}
