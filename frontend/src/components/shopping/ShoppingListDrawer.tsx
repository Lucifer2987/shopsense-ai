'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { getProductEmoji } from '@/components/ecommerce/ProductCard';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Check,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export function ShoppingListDrawer() {
  const {
    list,
    listLoading,
    isCartOpen,
    setIsCartOpen,
    updateItemQuantity,
    toggleItemComplete,
    removeItem,
    clearList,
    subtotal,
    itemCount,
    budget,
    setIsOptimizerOpen,
    setIsVoiceModalOpen,
  } = useApp();

  if (!isCartOpen) return null;

  const items = list?.shopping_items || [];
  const isOverBudget = budget !== null && subtotal > budget;
  const budgetRatio = budget ? Math.min(subtotal / budget, 1) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--bg-card)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[var(--text-primary)]">Your Basket</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in shopping list
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearList}
                  className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors px-2 py-1"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Budget Meter Alert (if set) */}
          {budget !== null && (
            <div className={`p-3.5 border-b text-xs ${
              isOverBudget
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
            }`}>
              <div className="flex justify-between items-center font-medium mb-1">
                <span>Budget: ₹{budget}</span>
                <span className="font-bold">
                  {isOverBudget ? `₹${(subtotal - budget).toFixed(0)} over budget` : `₹${(budget - subtotal).toFixed(0)} remaining`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverBudget ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetRatio * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {listLoading ? (
              <div className="space-y-3 py-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-[var(--bg-card-subtle)] animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-[var(--bg-card-subtle)] flex items-center justify-center text-2xl mb-3">
                  🛒
                </div>
                <h4 className="font-semibold text-base text-[var(--text-primary)]">
                  Your list is empty
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
                  Browse products and add them, or use the voice assistant to shop with speech.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsVoiceModalOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Use Voice Shopping</span>
                </button>
              </div>
            ) : (
              items.map((item) => {
                const product = item.products;
                const emoji = getProductEmoji(product?.name || 'Product', product?.category);
                const itemTotal = (product?.price || 0) * (item.quantity || 1);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      item.is_completed
                        ? 'bg-[var(--bg-card-subtle)]/60 border-[var(--border-subtle)] opacity-60'
                        : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-emerald-500/30'
                    }`}
                  >
                    {/* Completion Checkbox & Details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                      <button
                        onClick={() => toggleItemComplete(item.id, item.is_completed)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          item.is_completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-[var(--border-strong)] hover:border-emerald-600'
                        }`}
                        aria-label={item.is_completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {item.is_completed && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <span className="text-xl select-none shrink-0">{emoji}</span>

                      <div className="min-w-0">
                        <h4 className={`text-xs font-semibold text-[var(--text-primary)] truncate ${
                          item.is_completed ? 'line-through text-[var(--text-muted)]' : ''
                        }`}>
                          {product?.name || 'Product'}
                        </h4>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {product?.brand ? `${product.brand} · ` : ''}{product?.unit || item.unit || '1 unit'}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls & Price */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 bg-[var(--bg-card-subtle)] rounded-lg p-0.5 border border-[var(--border-subtle)]">
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md hover:bg-[var(--bg-card)] text-[var(--text-secondary)] flex items-center justify-center transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-[var(--text-primary)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-md hover:bg-[var(--bg-card)] text-[var(--text-secondary)] flex items-center justify-center transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[50px]">
                        <span className="text-xs font-bold text-[var(--text-primary)] block">
                          ₹{itemTotal.toFixed(0)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[10px] text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Remove item"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer / Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-card-subtle)]/40 space-y-3">
              
              {/* Basket Optimizer CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsOptimizerOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-all group"
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Optimize Basket for Savings</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Total & Checkout preview */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs text-[var(--text-muted)] block">Estimated Total</span>
                  <span className="text-xl font-extrabold text-[var(--text-primary)]">
                    ₹{subtotal.toFixed(0)}
                  </span>
                </div>

                <button
                  onClick={() => alert(`Proceeding to checkout with ${itemCount} items for ₹${subtotal.toFixed(0)}!`)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition-all"
                >
                  Checkout
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
