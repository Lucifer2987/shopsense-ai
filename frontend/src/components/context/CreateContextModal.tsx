'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/context/AppContext';
import { Sparkles, Users, IndianRupee } from 'lucide-react';

interface CreateContextModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTEXT_TYPES = [
  { id: 'party', label: '🎉 Party / Get-together', desc: 'Drinks, snacks & treats' },
  { id: 'weekly_grocery', label: '🛒 Weekly Staples', desc: 'Dairy, bread, fresh veggies' },
  { id: 'healthy_shopping', label: '🥗 Health & Fitness', desc: 'Organic, protein & fresh fruits' },
  { id: 'breakfast', label: '🍳 Breakfast Prep', desc: 'Oats, eggs, fruits & milk' },
  { id: 'guests', label: '👥 Guests Visiting', desc: 'Beverages, snacks & tea essentials' },
];

export function CreateContextModal({ isOpen, onClose }: CreateContextModalProps) {
  const { setNewContext } = useApp();

  const [type, setType] = useState('party');
  const [people, setPeople] = useState('5');
  const [budget, setBudgetValue] = useState('1500');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await setNewContext(type, {
        type,
        people: people ? Number(people) : 1,
        budget: budget ? Number(budget) : undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set a Shopping Plan / Context" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Context Occasion Selector */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Occasion / Shopping Goal
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CONTEXT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                  type === t.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-semibold text-emerald-800 dark:text-emerald-200'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)]'
                }`}
              >
                <div className="font-medium text-[var(--text-primary)]">{t.label}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* People & Budget Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Number of People
            </label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="number"
                min="1"
                max="50"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Estimated Budget (₹)
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="number"
                min="100"
                step="100"
                value={budget}
                onChange={(e) => setBudgetValue(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>ShopSense will tailor recommendations and substitute calculations to this plan.</span>
        </div>

        {/* Form Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            {submitting ? 'Saving...' : 'Set Plan'}
          </button>
        </div>

      </form>
    </Modal>
  );
}
