'use client';

import SearchFullResultRow from './SearchFullResultRow';
import SearchResultGroup from '@/components/search/SearchResultGroup';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/pagination';
import LoadingSpinner from '@/components/loading-spinner';
import type { SearchFullResponse, SearchResponse, SearchTabType } from '@/lib/types/search';
import { SEARCH_GROUP_ORDER } from '@/lib/types/search';

interface Props {
  tab: SearchTabType;
  allResults: SearchResponse | null;
  fullResults: SearchFullResponse | null;
  isLoading: boolean;
  query: string;
  page: number;
  onPageChange: (page: number) => void;
}

export default function SearchFullResults({ tab, allResults, fullResults, isLoading, query, page, onPageChange }: Props) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!query || query.trim().length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <p className="text-base">Type at least 2 characters to search</p>
      </div>
    );
  }

  // "All" tab — grouped view using the quick search results
  if (tab === 'all') {
    if (!allResults) return null;

    const hasAny = SEARCH_GROUP_ORDER.some((type) => {
      const key = `${type}s` as keyof SearchResponse;
      return allResults[key].length > 0;
    });

    if (!hasAny) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-muted">
          <p className="text-base">No results for &ldquo;{query}&rdquo;</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {SEARCH_GROUP_ORDER.map((entityType) => {
          const key = `${entityType}s` as keyof SearchResponse;
          const items = allResults[key];
          if (!items.length) return null;
          return (
            <SearchResultGroup
              key={entityType}
              entityType={entityType}
              items={items}
              onSelect={(url) => router.push(url)}
            />
          );
        })}
      </div>
    );
  }

  // Specific type tab — paginated list
  if (!fullResults) return null;

  if (fullResults.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <p className="text-base">No results for &ldquo;{query}&rdquo;</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-muted mb-3">
        {fullResults.meta.total} result{fullResults.meta.total !== 1 ? 's' : ''}
      </p>
      <div className="space-y-1">
        {fullResults.data.map((item) => (
          <SearchFullResultRow key={item.id} item={item} />
        ))}
      </div>
      {fullResults.meta.totalPages > 1 && (
        <div className="mt-6">
          <Pagination meta={fullResults.meta} page={page} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
