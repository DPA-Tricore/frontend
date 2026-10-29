'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SearchInput from './SearchInput';
import SearchResultGroup from './SearchResultGroup';
import { useSearch } from '@/lib/hooks/useSearch';
import { SEARCH_GROUP_ORDER } from '@/lib/types/search';
import type { SearchResponse } from '@/lib/types/search';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function hasResults(results: SearchResponse): boolean {
  return SEARCH_GROUP_ORDER.some((type) => {
    const key = `${type}s` as keyof SearchResponse;
    return results[key].length > 0;
  });
}

function getGroupItems(results: SearchResponse, entityType: string) {
  const key = `${entityType}s` as keyof SearchResponse;
  return results[key] ?? [];
}

export default function SearchPalette({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { query, setQuery, results, isLoading, reset } = useSearch();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const handleSelect = (url: string) => {
    router.push(url);
    onClose();
    reset();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl mx-4 rounded-xl shadow-2xl bg-[var(--bg-primary)] border border-[var(--border)] overflow-hidden">
        <SearchInput
          value={query}
          onChange={setQuery}
          isLoading={isLoading}
          onClear={reset}
        />

        {results && hasResults(results) && (
          <div className="max-h-[60vh] overflow-y-auto py-2 space-y-2">
            {SEARCH_GROUP_ORDER.map((entityType) => (
              <SearchResultGroup
                key={entityType}
                entityType={entityType}
                items={getGroupItems(results, entityType)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}

        {results && !hasResults(results) && query.trim().length >= 2 && (
          <p className="px-4 py-6 text-sm text-muted text-center">
            No results for &ldquo;{query}&rdquo;
          </p>
        )}

        {!results && !isLoading && (
          <p className="px-4 py-4 text-xs text-muted text-center">
            Type at least 2 characters to search
          </p>
        )}

        <div className="px-4 py-2 border-t border-[var(--border)] flex gap-3 text-xs text-muted">
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">Esc</kbd> close</span>
          <span><kbd className="font-mono">⌘K</kbd> toggle</span>
        </div>
      </div>
    </div>
  );
}
