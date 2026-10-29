'use client';

import type { SearchTabType, SearchEntityType, SearchResponse } from '@/lib/types/search';

const TABS: { key: SearchTabType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'lead', label: 'Leads' },
  { key: 'contact', label: 'Contacts' },
  { key: 'task', label: 'Tasks' },
  { key: 'document', label: 'Documents' },
  { key: 'automation', label: 'Automations' },
  { key: 'reminder', label: 'Reminders' },
  { key: 'automationStep', label: 'Steps' },
];

function countForTab(key: SearchEntityType, allResults: SearchResponse | null): number | null {
  if (!allResults) return null;
  const groupKey = `${key}s` as keyof SearchResponse;
  return allResults[groupKey].length;
}

interface Props {
  activeTab: SearchTabType;
  onTabChange: (tab: SearchTabType) => void;
  allResults: SearchResponse | null;
}

export default function SearchTabs({ activeTab, onTabChange, allResults }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-[var(--border)] overflow-x-auto pb-0 scrollbar-none">
      {TABS.map(({ key, label }) => {
        const count = key !== 'all' ? countForTab(key as SearchEntityType, allResults) : null;
        const isActive = activeTab === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                : 'text-muted hover:text-primary'
            }`}
          >
            {label}
            {count !== null && count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-[var(--bg-secondary)] text-muted'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
