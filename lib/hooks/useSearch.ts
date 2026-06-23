'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchApi } from '@/lib/api/search';
import type { SearchResponse } from '@/lib/types/search';

const DEBOUNCE_MS = 300;

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchApi.search(q.trim());
      setResults(data);
    } catch (err: any) {
      setError(err.message ?? 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchResults(query), DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, fetchResults]);

  const reset = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
  }, []);

  return { query, setQuery, results, isLoading, error, reset };
}
