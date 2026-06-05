'use client';

import { useState, useCallback, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { reminderAPI } from '@/lib/api/reminders';
import type { ReminderResponseDto } from '@/lib/types/reminders';
import { PaginationMeta } from '@/lib/types/common';
import { colors } from '@/lib/theme/colors';
import PageHeader from '@/components/page-header';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import PaginationSummary from '@/components/pagination-summary';
import ReminderFilters from './components/reminder-filters';
import ReminderListView from './components/reminder-list-view';
import ReminderCreateModal from './components/reminder-create-modal';

type SortField = 'reminderTime' | 'dueDate' | 'title' | 'status' | 'createdAt';

const LIMIT = 10;

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderResponseDto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('reminderTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reminderAPI.list({
        page,
        limit: LIMIT,
        ...(search && { search }),
        sortBy,
        sortOrder,
        ...(statusFilter && { status: statusFilter }),
      });
      setReminders(response.data);
      setMeta(response.meta);
      setError(null);
    } catch {
      setError('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await reminderAPI.acknowledge(id);
      fetchReminders();
    } catch {
      setError('Failed to acknowledge reminder');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await reminderAPI.dismiss(id);
      fetchReminders();
    } catch {
      setError('Failed to dismiss reminder');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await reminderAPI.delete(id);
      fetchReminders();
    } catch {
      setError('Failed to delete reminder');
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Reminders"
        subtitle="Manage your reminders and notifications"
        error={error}
        actions={
          <button onClick={() => setShowModal(true)} className={colors.button.primary}>
            + Add Reminder
          </button>
        }
      />

      <ReminderFilters
        search={search}
        statusFilter={statusFilter}
        sortBy={sortBy}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        onStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
        onSortChange={(v) => { setSortBy(v); setPage(1); }}
      />

      {meta && <PaginationSummary meta={meta} page={page} limit={LIMIT} label="reminders" />}

      {loading ? (
        <LoadingSpinner message="Loading reminders..." />
      ) : reminders.length === 0 ? (
        <EmptyState
          message={search ? 'No reminders found. Try adjusting your search.' : 'No reminders yet. Create your first one!'}
          icon={<Bell className="w-12 h-12 text-subtle mx-auto" />}
        />
      ) : (
        <ReminderListView
          reminders={reminders}
          meta={meta}
          page={page}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onPageChange={setPage}
          onAcknowledge={handleAcknowledge}
          onDismiss={handleDismiss}
          onDelete={handleDelete}
        />
      )}

      <ReminderCreateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => { setShowModal(false); fetchReminders(); }}
      />
    </div>
  );
}
