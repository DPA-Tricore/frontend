'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { leadsApi, LeadResponseDto } from '@/lib/api/leads';
import { PaginationMeta } from '@/lib/types/common';
import { colors } from '@/lib/theme/colors';
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

  const [leads, setLeads] = useState<LeadResponseDto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'firstName' | 'lastName' | 'status' | 'leadType'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [leadTypeFilter, setLeadTypeFilter] = useState('');

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await leadsApi.getLeads({
        page,
        limit,
        ...(search && { search }),
        sortBy,
        sortOrder,
        ...(statusFilter && { status: statusFilter }),
        ...(leadTypeFilter && { leadType: leadTypeFilter }),
      });

      if ((response as any).data) {
        setLeads((response as any).data);
        setMeta((response as any).meta);
      } else {
        setLeads(response as any);
        setMeta(null);
      }
      setError(null);
    } catch {
      setError('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, statusFilter, leadTypeFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field as any);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleStatusChange = useCallback(
    async (leadId: string, newStatus: string, oldStatus: string) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
      );
      try {
        await leadsApi.updateLead(leadId, { status: newStatus });
      } catch {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: oldStatus } : l)),
        );
        setError('Failed to update lead status');
      }
    },
    [],
  );

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
        onCreated={() => { setPage(1); fetchLeads(); }}
      />

      {view === 'list' && (
        <>
          <LeadFilters
            search={search}
            statusFilter={statusFilter}
            leadTypeFilter={leadTypeFilter}
            sortBy={sortBy}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            onStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
            onLeadTypeFilter={(v) => { setLeadTypeFilter(v); setPage(1); }}
            onSortChange={(v) => setSortBy(v as any)}
          />
          {meta && <PaginationSummary meta={meta} page={page} limit={limit} label="leads" />}
        </>
      )}

      {loading ? (
        <LoadingSpinner message="Loading leads..." />
      ) : leads.length === 0 ? (
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
              <LeadBoardView onStatusChange={handleStatusChange} />
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
