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

  // Derive a realistic strike-through MRP & discount percentage for real e-commerce feel
  const mrp = Math.round(product.price * 1.18);
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);

  // Check if item is in shopping list
  const existingItem = list?.shopping_items?.find(
    item => item.product_id === product.id || item.products?.id === product.id
  );
  const currentQuantity = existingItem?.quantity || 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/50 p-2.5 sm:p-3.5 transition-all duration-150 shadow-2xs hover:shadow-md">
      
      <div>
        {/* Product Visual Container (Reference style) */}
        <div className="relative w-full aspect-square max-h-32 sm:max-h-38 rounded-xl bg-[var(--bg-card-subtle)] flex items-center justify-center mb-2.5 overflow-hidden border border-[var(--border-subtle)]">
          <span className="text-4xl sm:text-5xl filter drop-shadow-2xs select-none transition-transform group-hover:scale-105 duration-200">
            {emoji}
          </span>
          
          {/* Brand Tag */}
          {product.brand && (
            <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-md bg-[var(--bg-card)]/90 text-[var(--text-secondary)] border border-[var(--border-subtle)] shadow-2xs">
              {product.brand}
            </span>
          )}

          {/* Discount Tag (if in stock) */}
          {isAvailable && discountPercent > 0 && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-emerald-600 text-white shadow-2xs">
              {discountPercent}% OFF
            </span>
          )}

          {/* Out of Stock Overlay */}
          {!isAvailable && (
            <span className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center text-white text-[11px] font-extrabold uppercase tracking-wider">
              Sold Out
            </span>
          )}
        </div>

        {/* Weight / Pack Size */}
        <div className="text-[11px] font-medium text-[var(--text-muted)] mb-0.5">
          {product.unit || '1 unit'}
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-xs sm:text-sm text-[var(--text-primary)] line-clamp-2 leading-snug mb-1" title={product.name}>
          {product.name}
        </h3>
      </div>

      {/* Pricing & Add Stepper Row */}
      <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-end justify-between gap-1.5">
        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-sm sm:text-base font-black text-[var(--text-primary)]">
              ₹{product.price.toFixed(0)}
            </span>
            {discountPercent > 0 && (
              <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] line-through">
                ₹{mrp}
              </span>
            )}
          </div>
          <span className="text-[9px] text-[var(--text-muted)] block mt-0.5">
            incl. taxes
          </span>
        </div>

        {/* Add / Stepper Button */}
        {currentQuantity > 0 ? (
          <div className="flex items-center gap-0.5 sm:gap-1 bg-emerald-600 rounded-xl p-0.5 text-white shadow-2xs">
            <button
              onClick={() => updateItemQuantity(existingItem!.id, currentQuantity - 1)}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center font-bold transition-colors"
              aria-label={`Decrease ${product.name} quantity`}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-4 sm:w-5 text-center font-black text-xs sm:text-sm">
              {currentQuantity}
            </span>
            <button
              onClick={() => updateItemQuantity(existingItem!.id, currentQuantity + 1)}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center font-bold transition-colors"
              aria-label={`Increase ${product.name} quantity`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addItem(product, 1)}
            disabled={!isAvailable}
            className={`min-h-[32px] sm:min-h-[36px] px-3 sm:px-4 rounded-xl font-extrabold text-xs flex items-center gap-1 transition-all shadow-2xs ${
              isAvailable
                ? 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-600/30 hover:border-emerald-600 active:scale-95'
                : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-subtle)]'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="w-3 h-3" />
            <span>ADD</span>
          </button>
        )}
      </div>

    </div>
  );
}
