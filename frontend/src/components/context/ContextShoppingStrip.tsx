'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Product } from '@/types/product';
import * as productApi from '@/lib/api/products';
import { getProductEmoji } from '@/components/ecommerce/ProductCard';
import { Sparkles, Check, Plus, X } from 'lucide-react';

export function ContextShoppingStrip() {
  const { activeContext, clearContext, addItem, showToast } = useApp();
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedAll, setAddedAll] = useState(false);

  useEffect(() => {
    if (!activeContext) {
      setSuggestedProducts([]);
      return;
    }

    let isMounted = true;
    async function loadEventProducts() {
      setLoading(true);
      try {
        const type = activeContext?.context_type?.toLowerCase() || '';
        let categoryQuery: string | undefined = undefined;

        if (type.includes('party') || type.includes('friend') || type.includes('gathering') || type.includes('snack')) {
          categoryQuery = 'Snacks';
        } else if (type.includes('breakfast') || type.includes('morning')) {
          categoryQuery = 'Breakfast';
        }

        const allProducts = await productApi.getProducts({
          category: categoryQuery,
          in_stock: true,
        });

        if (isMounted) {
          let filtered = allProducts.slice(0, 4);
          if (filtered.length === 0) {
            const fallback = await productApi.getProducts({ in_stock: true });
            filtered = fallback.slice(0, 4);
          }
          setSuggestedProducts(filtered);
        }
      } catch (err) {
        console.warn('Could not load context suggestions:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEventProducts();
    return () => {
      isMounted = false;
    };
  }, [activeContext]);

  if (!activeContext || suggestedProducts.length === 0) {
    return null;
  }

  const data = activeContext.context_data || {};
  const occasion = activeContext.context_type?.replace(/_/g, ' ') || 'Occasion';
  const people = data.people ? `${data.people} guests` : null;
  const time = data.time || 'Upcoming';

  const handleAddAll = async () => {
    try {
      for (const prod of suggestedProducts) {
        await addItem(prod, 1);
      }
      setAddedAll(true);
      showToast(`✓ Added ${suggestedProducts.length} items for your ${occasion}`, 'success');
      setTimeout(() => setAddedAll(false), 3000);
    } catch (err) {
      console.error('Failed to add all items:', err);
    }
  };

  return (
    <section className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 p-3.5 sm:p-4 my-3 shadow-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-emerald-500/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 truncate capitalize">
              Planning for {people || 'Your Gathering'} {time !== 'Upcoming' ? `· ${time}` : ''}
            </h3>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              Handpicked items for your occasion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddAll}
            disabled={addedAll}
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition-all shadow-xs ${
              addedAll
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white active:scale-95'
            }`}
          >
            {addedAll ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added All</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add All ({suggestedProducts.length})</span>
              </>
            )}
          </button>

          <button
            onClick={clearContext}
            className="p-1 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 transition-colors"
            title="Dismiss shopping plan"
            aria-label="Dismiss shopping plan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Products Shelf — Crystal Clear High Contrast Item Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3">
        {suggestedProducts.map((prod) => (
          <div
            key={prod.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-500/25 shadow-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl select-none shrink-0">
                {getProductEmoji(prod.name, prod.category)}
              </span>
              <div className="min-w-0">
                {/* 100% Readable High-Contrast Product Name */}
                <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate" title={prod.name}>
                  {prod.name}
                </p>
                <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">
                  ₹{prod.price.toFixed(0)} <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">/ {prod.unit}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => addItem(prod, 1)}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shrink-0 ml-1 shadow-xs transition-colors"
              title={`Add ${prod.name}`}
              aria-label={`Add ${prod.name}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
