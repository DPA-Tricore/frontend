'use client';

import { useState, useEffect, useEffectEvent, useRef, useCallback } from 'react';
import { searchApi } from '@/lib/api/search';
import { useSearchPage } from '@/lib/hooks/useSearchPage';
import type { SearchResponse, SearchFullResponse, SearchEntityType } from '@/lib/types/search';
import SearchPageInput from './components/SearchPageInput';
import SearchTabs from './components/SearchTabs';
import SearchFilters from './components/SearchFilters';
import SearchFullResults from './components/SearchFullResults';

const DEBOUNCE_MS = 350;

export default function SearchPage() {
  const { state, setQ, setTab, setPage, setFilters, clearFilters, hasActiveFilters } = useSearchPage();

  const [allResults, setAllResults] = useState<SearchResponse | null>(null);
  const [fullResults, setFullResults] = useState<SearchFullResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = useCallback(async () => {
    const q = state.q.trim();
    if (q.length < 2) {
      setAllResults(null);
      setFullResults(null);
      return;
    }

    setIsLoading(true);
    try {
      if (state.tab === 'all') {
        const data = await searchApi.search(q, 10);
        setAllResults(data);
        setFullResults(null);
      } else {
        const data = await searchApi.searchFull({
          q,
          type: state.tab as SearchEntityType,
          page: state.page,
          status: state.status || undefined,
          dateFrom: state.dateFrom || undefined,
          dateTo: state.dateTo || undefined,
          assignedToId: state.assignedToId || undefined,
          entityTypeFilter: state.entityTypeFilter || undefined,
        });
        setFullResults(data);

        // Keep allResults populated for tab counts — refetch only if stale
        if (!allResults) {
          const all = await searchApi.search(q, 10);
          setAllResults(all);
        }
      }
    } catch {
      // silently ignore — search errors don't need a toast
    } finally {
      setIsLoading(false);
    }
  }, [state, allResults]);

  // Reads the latest results without making them a reason to search again.
  const runSearch = useEffectEvent(() => fetch());

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(runSearch, DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.q, state.tab, state.page, state.status, state.dateFrom, state.dateTo, state.assignedToId, state.entityTypeFilter]);

  // Reset allResults when query changes so tab counts refresh
  const handleQueryChange = (q: string) => {
    setAllResults(null);
    setFullResults(null);
    setQ(q);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Search input */}
      <div>
        <h1 className="text-2xl font-bold text-primary mb-4">Search</h1>
        <SearchPageInput value={state.q} onChange={handleQueryChange} />
      </div>

      {/* Tabs */}
      <SearchTabs activeTab={state.tab} onTabChange={setTab} allResults={allResults} />

      {/* Filters */}
      <SearchFilters
        tab={state.tab}
        filters={{
          status: state.status,
          dateFrom: state.dateFrom,
          dateTo: state.dateTo,
          assignedToId: state.assignedToId,
          entityTypeFilter: state.entityTypeFilter,
        }}
        hasActiveFilters={hasActiveFilters}
        onFiltersChange={setFilters}
        onClear={clearFilters}
      />

      {/* Results */}
      <SearchFullResults
        tab={state.tab}
        allResults={allResults}
        fullResults={fullResults}
        isLoading={isLoading}
        query={state.q}
        page={state.page}
        onPageChange={setPage}
      />
    </div>
  );
}
