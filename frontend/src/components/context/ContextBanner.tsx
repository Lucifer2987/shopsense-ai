'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, X, PlusCircle } from 'lucide-react';
import { CreateContextModal } from './CreateContextModal';

export function ContextBanner() {
  const { activeContext, clearContext, budget, subtotal } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!activeContext) {
    return (
      <>
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-base select-none">🎯</span>
            <div className="text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)] font-semibold">Planning an occasion?</strong>{' '}
              <span className="hidden sm:inline text-[var(--text-muted)]">
                Set a target budget & party plan to get tailored substitutes.
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Set Goal</span>
          </button>
        </div>

        <CreateContextModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  const data = activeContext.context_data || {};
  const occasion = activeContext.context_type?.replace(/_/g, ' ') || 'Special Shopping';
  const people = data.people ? `${data.people} people` : null;
  const targetBudget = data.budget || budget;

  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/25 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <div>
            <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-100 text-xs">
              <span className="capitalize">{occasion} Plan</span>
              {people && (
                <span className="font-medium px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px]">
                  👥 {people}
                </span>
              )}
            </div>

            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
              {targetBudget ? `Target: ₹${targetBudget} · Basket: ₹${subtotal.toFixed(0)}` : 'Tailoring recommendations to this plan'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline px-2 py-1"
          >
            Edit
          </button>
          <button
            onClick={clearContext}
            className="p-1 rounded-md text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 transition-colors"
            title="Clear shopping plan"
            aria-label="Clear plan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <CreateContextModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
