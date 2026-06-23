'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import type { SearchTabType, SearchEntityType } from '@/lib/types/search';

export interface SearchPageState {
  q: string;
  tab: SearchTabType;
  page: number;
  status: string;
  dateFrom: string;
  dateTo: string;
  assignedToId: string;
  entityTypeFilter: string;
}

export function useSearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: SearchPageState = {
    q: searchParams.get('q') ?? '',
    tab: (searchParams.get('tab') as SearchTabType) ?? 'all',
    page: Number(searchParams.get('page') ?? 1),
    status: searchParams.get('status') ?? '',
    dateFrom: searchParams.get('dateFrom') ?? '',
    dateTo: searchParams.get('dateTo') ?? '',
    assignedToId: searchParams.get('assignedToId') ?? '',
    entityTypeFilter: searchParams.get('entityTypeFilter') ?? '',
  };

  const push = useCallback(
    (updates: Partial<SearchPageState>) => {
      const next = new URLSearchParams(searchParams.toString());
      const merged = { ...state, ...updates };

      merged.q ? next.set('q', merged.q) : next.delete('q');
      merged.tab !== 'all' ? next.set('tab', merged.tab) : next.delete('tab');
      merged.page > 1 ? next.set('page', String(merged.page)) : next.delete('page');
      merged.status ? next.set('status', merged.status) : next.delete('status');
      merged.dateFrom ? next.set('dateFrom', merged.dateFrom) : next.delete('dateFrom');
      merged.dateTo ? next.set('dateTo', merged.dateTo) : next.delete('dateTo');
      merged.assignedToId ? next.set('assignedToId', merged.assignedToId) : next.delete('assignedToId');
      merged.entityTypeFilter ? next.set('entityTypeFilter', merged.entityTypeFilter) : next.delete('entityTypeFilter');

      router.push(`${pathname}?${next.toString()}`);
    },
    [router, pathname, searchParams, state],
  );

  const setQ = useCallback((q: string) => push({ q, page: 1 }), [push]);
  const setTab = useCallback((tab: SearchTabType) => push({ tab, page: 1, status: '', dateFrom: '', dateTo: '', assignedToId: '', entityTypeFilter: '' }), [push]);
  const setPage = useCallback((page: number) => push({ page }), [push]);
  const setFilters = useCallback((filters: Partial<Pick<SearchPageState, 'status' | 'dateFrom' | 'dateTo' | 'assignedToId' | 'entityTypeFilter'>>) => push({ ...filters, page: 1 }), [push]);
  const clearFilters = useCallback(() => push({ status: '', dateFrom: '', dateTo: '', assignedToId: '', entityTypeFilter: '', page: 1 }), [push]);

  const hasActiveFilters = !!(state.status || state.dateFrom || state.dateTo || state.assignedToId || state.entityTypeFilter);

  return { state, setQ, setTab, setPage, setFilters, clearFilters, hasActiveFilters };
}
