'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { SearchTabType } from '@/lib/types/search';

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

  // Rebuilt only when the URL changes, so the callbacks below stay stable between renders.
  const state = useMemo<SearchPageState>(
    () => ({
      q: searchParams.get('q') ?? '',
      tab: (searchParams.get('tab') as SearchTabType) ?? 'all',
      page: Number(searchParams.get('page') ?? 1),
      status: searchParams.get('status') ?? '',
      dateFrom: searchParams.get('dateFrom') ?? '',
      dateTo: searchParams.get('dateTo') ?? '',
      assignedToId: searchParams.get('assignedToId') ?? '',
      entityTypeFilter: searchParams.get('entityTypeFilter') ?? '',
    }),
    [searchParams],
  );

  const push = useCallback(
    (updates: Partial<SearchPageState>) => {
      const next = new URLSearchParams(searchParams.toString());
      const merged = { ...state, ...updates };

      // Defaults stay out of the URL.
      const setOrDelete = (key: string, value: string | null) => {
        if (value) next.set(key, value);
        else next.delete(key);
      };
      setOrDelete('q', merged.q);
      setOrDelete('tab', merged.tab !== 'all' ? merged.tab : null);
      setOrDelete('page', merged.page > 1 ? String(merged.page) : null);
      setOrDelete('status', merged.status);
      setOrDelete('dateFrom', merged.dateFrom);
      setOrDelete('dateTo', merged.dateTo);
      setOrDelete('assignedToId', merged.assignedToId);
      setOrDelete('entityTypeFilter', merged.entityTypeFilter);

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
