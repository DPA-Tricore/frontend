'use client';

import { useState, useEffect, useCallback } from 'react';
import { documentsApi } from '@/lib/api/documents';
import type { DocumentResponseDto } from '@/lib/types/documents';
import { PaginationMeta } from '@/lib/types/common';
import { colors } from '@/lib/theme/colors';
import PageHeader from '@/components/page-header';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import PaginationSummary from '@/components/pagination-summary';
import DocumentFilters from './components/document-filters';
import DocumentListView from './components/document-list-view';

type SortField = 'originalName' | 'fileSize' | 'createdAt';

const LIMIT = 10;

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResponseDto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await documentsApi.getDocuments({
        page,
        limit: LIMIT,
        ...(search && { search }),
        sortBy,
        sortOrder,
      });
      setDocuments(response.data);
      setMeta(response.meta);
      setError(null);
    } catch {
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (meta) setMeta({ ...meta, total: meta.total - 1 });
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Documents"
        subtitle="All files attached across your leads"
        error={error}
      />

      <DocumentFilters
        search={search}
        sortBy={sortBy}
        onSearch={(v) => { setSearch(v); setPage(1); }}
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
