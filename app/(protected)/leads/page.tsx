'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { colors } from '@/lib/theme/colors';
import { useLeadsList } from '@/lib/hooks/use-leads';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import PaginationSummary from '@/components/pagination-summary';
import LeadBoardView from './components/lead-board-view';
import LeadListView from './components/lead-list-view';
import LeadCreateModal from './components/lead-create-modal';
import LeadFilters from './components/lead-filters';
import LeadExportButton from './components/lead-export-button';
import ViewToggle, { type ViewMode } from './components/view-toggle';

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const view: ViewMode = searchParams.get('view') === 'list' ? 'list' : 'board';

  const [showForm, setShowForm] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'firstName' | 'lastName' | 'status' | 'leadType'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [leadTypeFilter, setLeadTypeFilter] = useState('');

  const {
    data,
    isLoading: loading,
    isError,
  } = useLeadsList(
    {
      page,
      limit,
      ...(search && { search }),
      sortBy,
      sortOrder,
      ...(statusFilter && { status: statusFilter }),
      ...(leadTypeFilter && { leadType: leadTypeFilter }),
    },
    { enabled: view === 'list' },
  );

  const leads = data?.data ?? [];
  const meta = data?.meta ?? null;
  const error = isError ? 'Failed to fetch leads' : null;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field as any);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Leads Management"
        subtitle="Track and manage your sales pipeline"
        error={error}
        actions={
          <>
            <ViewToggle />
            <LeadExportButton
              params={{
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
                ...(leadTypeFilter && { leadType: leadTypeFilter }),
              }}
            />
            <Link
              href="/leads/import"
              className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-colors border-[var(--border)] text-primary hover:opacity-70"
            >
              <Upload size={14} />
              Import CSV
            </Link>
            <button onClick={() => setShowForm(true)} className={colors.button.primary}>
              + Add Lead
            </button>
          </>
        }
      />

      <LeadCreateModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => setPage(1)}
      />

      {view === 'list' && (
        <>
          <LeadFilters
            search={searchInput}
            statusFilter={statusFilter}
            leadTypeFilter={leadTypeFilter}
            sortBy={sortBy}
            onSearch={(v) => { setSearchInput(v); setPage(1); }}
            onStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
            onLeadTypeFilter={(v) => { setLeadTypeFilter(v); setPage(1); }}
            onSortChange={(v) => setSortBy(v as any)}
          />
          {meta && <PaginationSummary meta={meta} page={page} limit={limit} label="leads" />}
        </>
      )}

      {view === 'list' && loading ? (
        <LoadingSpinner message="Loading leads..." />
      ) : view === 'list' && leads.length === 0 ? (
        <EmptyState
          message={search ? 'No leads found. Try adjusting your search.' : 'Create your first lead to get started!'}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            {view === 'board' ? (
              <LeadBoardView />
            ) : (
              <LeadListView
                leads={leads}
                meta={meta}
                page={page}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                onPageChange={setPage}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
