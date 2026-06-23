'use client';

import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import type { SearchEntityType } from '@/lib/types/search';
import {
  LEAD_STATUSES,
  TASK_STATUSES,
  TASK_TYPES,
  REMINDER_STATUSES,
  CONTACT_TYPES,
  AUTOMATION_ACTION_TYPES,
  AUTOMATION_STATUSES,
} from '@/lib/types/search';
import type { SearchPageState as PageState } from '@/lib/hooks/useSearchPage';

interface User { id: string; email: string; }

interface Props {
  tab: SearchEntityType | 'all';
  filters: Pick<PageState, 'status' | 'dateFrom' | 'dateTo' | 'assignedToId' | 'entityTypeFilter'>;
  hasActiveFilters: boolean;
  onFiltersChange: (f: Partial<Pick<PageState, 'status' | 'dateFrom' | 'dateTo' | 'assignedToId' | 'entityTypeFilter'>>) => void;
  onClear: () => void;
}

const STATUS_OPTIONS: Partial<Record<SearchEntityType, { value: string; label: string }[]>> = {
  lead: LEAD_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') })),
  task: TASK_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') })),
  reminder: REMINDER_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') })),
  automation: AUTOMATION_STATUSES,
};

const ENTITY_TYPE_OPTIONS: Partial<Record<SearchEntityType, { value: string; label: string }[]>> = {
  contact: CONTACT_TYPES.map((t) => ({ value: t, label: t })),
  task: TASK_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, ' ') })),
  automationStep: AUTOMATION_ACTION_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, ' ') })),
};

const ASSIGNED_TO_TABS: SearchEntityType[] = ['lead', 'task'];

export default function SearchFilters({ tab, filters, hasActiveFilters, onFiltersChange, onClear }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen && ASSIGNED_TO_TABS.includes(tab) && users.length === 0) {
      usersApi.getUsers().then((u) => setUsers(u as User[])).catch(() => {});
    }
  }, [isOpen, tab, users.length]);

  const statusOptions = STATUS_OPTIONS[tab];
  const entityTypeOptions = ENTITY_TYPE_OPTIONS[tab];
  const showAssignedTo = ASSIGNED_TO_TABS.includes(tab);

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            hasActiveFilters
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-[var(--border)] text-muted hover:text-primary interactive'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted hover:text-primary interactive rounded-lg"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] grid grid-cols-2 gap-4 md:grid-cols-4">
          {statusOptions && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Status</label>
              <select
                value={filters.status}
                onChange={(e) => onFiltersChange({ status: e.target.value })}
                className="w-full text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-primary outline-none"
              >
                <option value="">Any</option>
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          {entityTypeOptions && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Type</label>
              <select
                value={filters.entityTypeFilter}
                onChange={(e) => onFiltersChange({ entityTypeFilter: e.target.value })}
                className="w-full text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-primary outline-none"
              >
                <option value="">Any</option>
                {entityTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
              className="w-full text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
              className="w-full text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-primary outline-none"
            />
          </div>

          {showAssignedTo && (
            <div className="col-span-2 md:col-span-4">
              <label className="block text-xs font-medium text-muted mb-1.5">Assigned To</label>
              <select
                value={filters.assignedToId}
                onChange={(e) => onFiltersChange({ assignedToId: e.target.value })}
                className="w-full text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-primary outline-none"
              >
                <option value="">Anyone</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.email}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
