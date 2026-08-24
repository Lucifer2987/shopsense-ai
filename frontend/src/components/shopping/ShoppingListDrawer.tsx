'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Product } from '@/types/product';
import * as productApi from '@/lib/api/products';
import { getProductEmoji } from '@/components/ecommerce/ProductCard';
import {
  X,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Truck,
  ShieldCheck,
} from 'lucide-react';

export function ShoppingListDrawer() {
  const {
    list,
    listLoading,
    isCartOpen,
    setIsCartOpen,
    addItem,
    updateItemQuantity,
    toggleItemComplete,
    removeItem,
    clearList,
    subtotal,
    itemCount,
    budget,
    activeContext,
    setIsOptimizerOpen,
    setIsVoiceModalOpen,
  } = useApp();

  const [contextProducts, setContextProducts] = useState<Product[]>([]);

  // Load contextual cross-sells if user has an active plan
  useEffect(() => {
    if (!activeContext || !isCartOpen) return;
    let isMounted = true;

    async function loadSuggestions() {
      try {
        const type = activeContext?.context_type?.toLowerCase() || '';
        const cat = type.includes('snack') || type.includes('party') || type.includes('friend') ? 'Snacks' : 'Breakfast';
        const products = await productApi.getProducts({ category: cat, in_stock: true });
        if (isMounted) {
          // Exclude items already in cart
          const existingIds = new Set(list?.shopping_items?.map(i => i.product_id || i.products?.id));
          const available = products.filter(p => !existingIds.has(p.id)).slice(0, 3);
          setContextProducts(available);
        }
      } catch (err) {
        console.warn('Could not load cart cross-sells:', err);
      }
    }

    loadSuggestions();
    return () => {
      isMounted = false;
    };
  }, [activeContext, isCartOpen, list?.shopping_items]);

  if (!isCartOpen) return null;

  const items = list?.shopping_items || [];
  const freeDeliveryThreshold = 199;
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 25;
  const grandTotal = subtotal + deliveryFee;
  const isOverBudget = budget !== null && grandTotal > budget;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-[var(--bg-card)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-[var(--text-primary)]">Your Cart</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} · Instant 12-min delivery
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

          {/* Free Delivery Bar */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-500/15 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              {subtotal >= freeDeliveryThreshold ? (
                <span className="font-bold">🎉 You unlocked FREE Instant Delivery!</span>
              ) : (
                <span>
                  Add <strong className="font-black">₹{(freeDeliveryThreshold - subtotal).toFixed(0)}</strong> more for <strong>FREE Delivery</strong>
                </span>
              )}
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
                <h4 className="font-bold text-base text-[var(--text-primary)]">
                  Your cart is empty
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
                  Add groceries from the store or tell ShopSense what you need.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsVoiceModalOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Voice Shop Now</span>
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-2.5">
                  {items.map((item) => {
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
                        {/* Checkbox & Name */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                          <button
                            onClick={() => toggleItemComplete(item.id, item.is_completed)}
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                              item.is_completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-[var(--border-strong)] hover:border-emerald-600'
                            }`}
                            aria-label={item.is_completed ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {item.is_completed && <Check className="w-3 h-3" />}
                          </button>

                          <span className="text-xl select-none shrink-0">{emoji}</span>

                          <div className="min-w-0">
                            <h4 className={`text-xs font-bold text-[var(--text-primary)] truncate ${
                              item.is_completed ? 'line-through text-[var(--text-muted)]' : ''
                            }`}>
                              {product?.name || 'Product'}
                            </h4>
                            <p className="text-[11px] text-[var(--text-muted)]">
                              {product?.unit || item.unit || '1 unit'} · ₹{product?.price.toFixed(0)} each
                            </p>
                          </div>
                        </div>

                        {/* Stepper & Price */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="flex items-center gap-0.5 bg-emerald-600 text-white rounded-lg p-0.5 shadow-2xs">
                            <button
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                              className="w-5 h-5 rounded hover:bg-emerald-700 active:bg-emerald-800 flex items-center justify-center font-bold"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-4 text-center text-xs font-black">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                              className="w-5 h-5 rounded hover:bg-emerald-700 active:bg-emerald-800 flex items-center justify-center font-bold"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-[45px]">
                            <span className="text-xs font-black text-[var(--text-primary)] block">
                              ₹{itemTotal.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Contextual "You Might Also Need" inside cart */}
                {contextProducts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                      You might also need for your plan:
                    </span>
                    <div className="space-y-1.5">
                      {contextProducts.map(prod => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span>{getProductEmoji(prod.name, prod.category)}</span>
                            <span className="font-semibold text-[var(--text-primary)] truncate">{prod.name}</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">₹{prod.price.toFixed(0)}</span>
                          </div>
                          <button
                            onClick={() => addItem(prod, 1)}
                            className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Drawer Footer & Bill Breakdown */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-card-subtle)]/40 space-y-3">
              
              {/* Basket Optimizer CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsOptimizerOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-all group"
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Check cheaper brand alternatives</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Bill Details */}
              <div className="space-y-1 text-xs pt-1">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Item Total</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Delivery Partner Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[var(--text-primary)] pt-1.5 border-t border-[var(--border-subtle)]">
                  <span>To Pay</span>
                  <span>₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={() => alert(`Order placed successfully for ${itemCount} items worth ₹${grandTotal.toFixed(0)}! Delivering in 12 mins.`)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Place Order · ₹{grandTotal.toFixed(0)}</span>
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
