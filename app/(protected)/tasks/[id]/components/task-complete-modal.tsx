'use client';

import { useState } from 'react';
import { TASK_RESULT_TYPES } from '@/lib/constants/tasks';
import type { CreateTaskRequest } from '@/lib/types/tasks';
import { useResetOnOpen } from '@/lib/hooks/use-reset-on-open';

interface TaskCompleteModalProps {
  isOpen: boolean;
  saving: boolean;
  onCancel: () => void;
  onConfirm: (data: Partial<CreateTaskRequest>) => void;
}

/** Completing a task asks how it went, so the result is captured while it's fresh. Both fields are optional. */
export default function TaskCompleteModal({ isOpen, saving, onCancel, onConfirm }: TaskCompleteModalProps) {
  const [resultType, setResultType] = useState('');
  const [outcome, setOutcome] = useState('');

  useResetOnOpen(isOpen, () => {
    setResultType('');
    setOutcome('');
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      status: 'COMPLETED',
      completedAt: new Date(),
      ...(resultType && { resultType }),
      ...(outcome.trim() && { outcome: outcome.trim() }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="surface border border-[var(--border)] rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-base font-semibold text-primary mb-1">Complete task</h3>
        <p className="text-sm text-subtle mb-5">How did it go?</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {TASK_RESULT_TYPES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setResultType((cur) => (cur === r.value ? '' : r.value))}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                resultType === r.value
                  ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                  : 'border-[var(--border)] text-primary hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <textarea
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          rows={3}
          placeholder="Outcome notes (optional)"
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary resize-none mb-5"
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 px-4 py-2 text-sm border border-[var(--border)] rounded-lg text-primary hover:opacity-70 transition-opacity disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Mark complete'}
          </button>
        </div>
      </div>
    </div>
  );
}
