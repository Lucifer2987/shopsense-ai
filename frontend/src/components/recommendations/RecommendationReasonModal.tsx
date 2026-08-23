'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { RecommendationItem } from '@/types/recommendation';
import { Check, Sparkles, ShoppingBag } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getProductEmoji } from '@/components/ecommerce/ProductCard';

interface RecommendationReasonModalProps {
  item: RecommendationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RecommendationReasonModal({
  item,
  isOpen,
  onClose,
}: RecommendationReasonModalProps) {
  const { addItem } = useApp();

  if (!item) return null;

  const emoji = getProductEmoji(item.product.name, item.product.category);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Why did ShopSense suggest this?" maxWidth="md">
      <div className="space-y-4">
        
        {/* Product summary */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
          <span className="text-3xl select-none">{emoji}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-[var(--text-primary)]">{item.product.name}</h4>
            <p className="text-xs text-[var(--text-muted)]">
              {item.product.brand ? `${item.product.brand} · ` : ''}{item.product.unit}
            </p>
          </div>
          <span className="font-extrabold text-sm text-[var(--text-primary)]">
            ₹{item.product.price.toFixed(0)}
          </span>
        </div>

        {/* Real Backend Signal Reasons */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)] block">
            Matching Signals & Factors:
          </span>

          <div className="space-y-2">
            {item.reason && item.reason.length > 0 ? (
              item.reason.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs text-[var(--text-primary)]"
                >
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{reason}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                Based on your shopping trends and catalog availability.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Close
          </button>

          <button
            onClick={() => {
              addItem(item.product, 1);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Basket</span>
          </button>
        </div>

      </div>
    </Modal>
  );
}
