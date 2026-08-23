'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { optimizeBasket } from '@/lib/api/basket';
import { BasketOptimizationResult, BasketSuggestion } from '@/types/basket';
import { getProducts } from '@/lib/api/products';
import { ArrowRight, TrendingDown, Check } from 'lucide-react';

export function BasketOptimizerModal() {
  const {
    list,
    budget,
    isOptimizerOpen,
    setIsOptimizerOpen,
    subtotal,
    refreshList,
    showToast,
    addItem,
    removeItem,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BasketOptimizationResult | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<number[]>([]);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (isOptimizerOpen && list?.id) {
      loadOptimization();
    }
  }, [isOptimizerOpen, list?.id, budget]);

  const loadOptimization = async () => {
    if (!list?.id) return;
    setLoading(true);
    try {
      const data = await optimizeBasket(list.id, budget || undefined);
      setResult(data);
      if (data.suggestions) {
        setSelectedSuggestions(data.suggestions.map((_, idx) => idx));
      }
    } catch (err: any) {
      console.error('Failed to optimize basket:', err);
      showToast(err?.message || 'Could not optimize basket', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    setSelectedSuggestions(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleApply = async () => {
    if (!result?.suggestions || !list?.shopping_items) return;
    setApplying(true);

    try {
      const allProducts = await getProducts();

      for (const idx of selectedSuggestions) {
        const suggestion = result.suggestions[idx];
        
        const currentItem = list.shopping_items.find(
          item => item.products?.name.toLowerCase() === suggestion.current_product.toLowerCase()
        );

        const replacementProduct = allProducts.find(
          p => p.name.toLowerCase() === suggestion.replacement.toLowerCase()
        );

        if (currentItem && replacementProduct) {
          await removeItem(currentItem.id);
          await addItem(replacementProduct, currentItem.quantity, currentItem.unit);
        }
      }

      await refreshList();
      showToast('Applied basket optimizations!', 'success');
      setIsOptimizerOpen(false);
    } catch (err: any) {
      console.error('Failed to apply optimizations:', err);
      showToast('Failed to apply some substitutions', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (!isOptimizerOpen) return null;

  return (
    <Modal
      isOpen={isOptimizerOpen}
      onClose={() => setIsOptimizerOpen(false)}
      title="Basket Optimizer"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Loading state */}
        {loading ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Finding cheaper substitutes & checking budget...
            </p>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {/* Totals Comparison Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
              <div>
                <span className="text-[11px] text-[var(--text-muted)] block">Current Total</span>
                <span className="text-base font-bold text-[var(--text-primary)]">
                  ₹{result.current_total?.toFixed(0) || subtotal.toFixed(0)}
                </span>
              </div>

              {result.optimized_total !== undefined && result.optimized_total < result.current_total && (
                <div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
                    Optimized Total
                  </span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{result.optimized_total.toFixed(0)}
                  </span>
                </div>
              )}

              {result.savings !== undefined && result.savings > 0 && (
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
                    Potential Savings
                  </span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    ₹{result.savings.toFixed(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Suggestions list */}
            {result.suggestions && result.suggestions.length > 0 ? (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)] block">
                  Suggested Smart Substitutions ({result.suggestions.length})
                </span>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {result.suggestions.map((s, idx) => {
                    const isSelected = selectedSuggestions.includes(idx);
                    const reasons = Array.isArray(s.reason) ? s.reason.join(', ') : s.reason;

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleSuggestion(idx)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/40'
                            : 'bg-[var(--bg-card)] border-[var(--border-subtle)] opacity-70'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-[var(--border-strong)]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                            <span>{s.current_product}</span>
                            <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                            <span className="text-emerald-600 dark:text-emerald-400">{s.replacement}</span>
                          </div>

                          <div className="flex items-center justify-between mt-1 text-[11px] text-[var(--text-muted)]">
                            <span>{reasons}</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              Save ₹{s.saving.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explicit Approval CTA */}
                <div className="pt-3 flex items-center justify-between gap-3 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => setIsOptimizerOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleApply}
                    disabled={selectedSuggestions.length === 0 || applying}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                  >
                    {applying ? 'Applying...' : `Apply ${selectedSuggestions.length} Substitutions`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Check className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Your basket is already optimal!
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {result.message || 'No cheaper substitutes were required for your current list.'}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
