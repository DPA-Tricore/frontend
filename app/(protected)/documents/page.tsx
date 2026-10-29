'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ListDocumentsParams, PaginatedDocumentResponse } from '@/lib/types/documents';
import { useDocumentsList } from '@/lib/hooks/use-documents';
import { documentKeys } from '@/lib/queries/keys';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import PageHeader from '@/components/page-header';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import PaginationSummary from '@/components/pagination-summary';
import DocumentFilters from './components/document-filters';
import DocumentListView from './components/document-list-view';

type SortField = 'originalName' | 'fileSize' | 'createdAt';

const LIMIT = 10;

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filters: ListDocumentsParams = { page, limit: LIMIT, ...(search && { search }), sortBy, sortOrder };
  const { data, isLoading: loading, isError } = useDocumentsList(filters);
  const documents = data?.data ?? [];
  const meta = data?.meta ?? null;
  const error = isError ? 'Failed to fetch documents' : null;

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleDeleted = (id: string) => {
    queryClient.setQueryData<PaginatedDocumentResponse>(documentKeys.list(filters), (prev) =>
      prev && {
        data: prev.data.filter((d) => d.id !== id),
        meta: { ...prev.meta, total: prev.meta.total - 1 },
      },
    );
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Documents"
        error={error}
      />

      <DocumentFilters
        search={searchInput}
        sortBy={sortBy}
        onSearch={(v) => { setSearchInput(v); setPage(1); }}
        onSortChange={(v) => { setSortBy(v); setPage(1); }}
      />

      {meta && <PaginationSummary meta={meta} page={page} limit={LIMIT} label="documents" />}

      {loading ? (
        <LoadingSpinner message="Loading documents..." />
      ) : documents.length === 0 ? (
        <EmptyState
          message={search ? 'No documents found. Try adjusting your search.' : 'No documents uploaded yet.'}
        />
      ) : (
        <DocumentListView
          documents={documents}
          meta={meta}
          page={page}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onPageChange={setPage}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
