'use client';

import React, { useState } from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { RecommendationItem } from '@/types/recommendation';
import { useApp } from '@/context/AppContext';
import { getProductEmoji } from '@/components/ecommerce/ProductCard';
import { RecommendationReasonModal } from './RecommendationReasonModal';
import { Plus, HelpCircle, Sparkles } from 'lucide-react';

export function RecommendationsSection() {
  const { recommendations, loading } = useRecommendations(4);
  const { addItem, list } = useApp();
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null);

  if (!loading && recommendations.length === 0) return null;

  return (
    <section className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:p-5 shadow-xs">
      
      {/* Shelf Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="font-extrabold text-sm sm:text-base text-[var(--text-primary)] flex items-center gap-1.5">
            <span>Picked for You</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </h2>
          <p className="text-[11px] text-[var(--text-muted)]">
            Based on your shopping frequency & seasonal favorites
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-[var(--bg-card-subtle)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recommendations.map((item) => {
            const product = item.product;
            const emoji = getProductEmoji(product.name, product.category);
            const topReason = item.reason?.[0] || 'Matches your usual preferences';

            const inList = list?.shopping_items?.some(
              i => i.product_id === product.id || i.products?.id === product.id
            );

            return (
              <div
                key={product.id}
                className="flex flex-col justify-between p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-emerald-600/30 transition-all duration-150"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl select-none">{emoji}</span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-[var(--text-primary)] truncate" title={product.name}>
                          {product.name}
                        </h4>
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          {product.brand ? `${product.brand} · ` : ''}{product.unit}
                        </span>
                      </div>
                    </div>

                    <span className="font-black text-xs text-[var(--text-primary)] shrink-0">
                      ₹{product.price.toFixed(0)}
                    </span>
                  </div>

                  {/* Short natural reason tag */}
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-500/15 line-clamp-1 mb-2">
                    {topReason}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Why this?</span>
                  </button>

                  <button
                    onClick={() => addItem(product, 1)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      inList
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>{inList ? 'Added' : 'Add'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reason Modal */}
      <RecommendationReasonModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
}
