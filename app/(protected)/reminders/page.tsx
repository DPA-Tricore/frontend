'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Bell } from 'lucide-react';
import { reminderAPI } from '@/lib/api/reminders';
import type { ReminderResponseDto } from '@/lib/types/reminders';
import { PaginationMeta } from '@/lib/types/common';
import { colors } from '@/lib/theme/colors';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import PageHeader from '@/components/page-header';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import PaginationSummary from '@/components/pagination-summary';
import ReminderFilters from './components/reminder-filters';
import ReminderListView from './components/reminder-list-view';
import ReminderCreateModal from './components/reminder-create-modal';
import ViewToggle, { type ViewMode } from './components/view-toggle';

const ReminderCalendarView = dynamic(() => import('./components/reminder-calendar-view'), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading calendar..." />,
});

type SortField = 'reminderTime' | 'dueDate' | 'title' | 'status' | 'createdAt';

const LIMIT = 10;
const CALENDAR_LIMIT = 200;

export default function RemindersPage() {
  const searchParams = useSearchParams();
  const view: ViewMode = searchParams.get('view') === 'list' ? 'list' : 'calendar';

  const [reminders, setReminders] = useState<ReminderResponseDto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [createAtDate, setCreateAtDate] = useState<Date | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [sortBy, setSortBy] = useState<SortField>('reminderTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState('');

  const [calendarReminders, setCalendarReminders] = useState<ReminderResponseDto[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);

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

  // Calendar view shows every reminder (not just the current page/filter) so a
  // month grid isn't missing entries; ListRemindersParams has no date-range
  // filter yet, so this fetches a generous page instead of the true range.
  const fetchCalendarReminders = useCallback(async () => {
    try {
      setCalendarLoading(true);
      const response = await reminderAPI.list({
        limit: CALENDAR_LIMIT,
        sortBy: 'dueDate',
        sortOrder: 'asc',
      });
      setCalendarReminders(response.data);
      setError(null);
    } catch {
      setError('Failed to fetch reminders');
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'calendar') {
      fetchCalendarReminders();
    } else {
      fetchReminders();
    }
  }, [view, fetchReminders, fetchCalendarReminders]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Calendar mutations patch calendarReminders in place with the server's
  // response instead of refetching: refetching flips calendarLoading, which
  // unmounts/remounts the whole calendar (losing drag state, view, scroll
  // position) and reads as a flicker instead of a smooth update.
  const handleAcknowledge = async (id: string) => {
    try {
      const updated = await reminderAPI.acknowledge(id);
      if (view === 'calendar') {
        setCalendarReminders((rs) => rs.map((r) => (r.id === id ? updated : r)));
      } else {
        fetchReminders();
      }
    } catch {
      setError('Failed to acknowledge reminder');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const updated = await reminderAPI.dismiss(id);
      if (view === 'calendar') {
        setCalendarReminders((rs) => rs.map((r) => (r.id === id ? updated : r)));
      } else {
        fetchReminders();
      }
    } catch {
      setError('Failed to dismiss reminder');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await reminderAPI.delete(id);
      if (view === 'calendar') {
        setCalendarReminders((rs) => rs.filter((r) => r.id !== id));
      } else {
        fetchReminders();
      }
    } catch {
      setError('Failed to delete reminder');
    }
  };

  const handleCreateAt = (atDate: Date) => {
    setCreateAtDate(atDate);
    setShowModal(true);
  };

  const handleReschedule = async (id: string, reminderTime: string) => {
    // Apply the new position immediately: react-big-calendar's drag preview
    // already shows the event at the drop target, so waiting for the network
    // round-trip before updating state means it snaps back to the old slot
    // for a moment, then jumps to the new one once the request resolves.
    const previous = calendarReminders;
    setCalendarReminders((rs) =>
      rs.map((r) => (r.id === id ? { ...r, reminderTime, dueDate: reminderTime } : r))
    );
    try {
      const updated = await reminderAPI.update(id, { reminderTime, dueDate: reminderTime });
      setCalendarReminders((rs) => rs.map((r) => (r.id === id ? updated : r)));
    } catch {
      setCalendarReminders(previous);
      setError('Failed to reschedule reminder');
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Reminders"
        subtitle="Manage your reminders and notifications"
        error={error}
        actions={
          <>
            <ViewToggle />
            <button
              onClick={() => {
                setCreateAtDate(null);
                setShowModal(true);
              }}
              className={colors.button.primary}
            >
              + Add Reminder
            </button>
          </>
        }
      />

      {view === 'list' && (
        <>
          <ReminderFilters
            search={searchInput}
            statusFilter={statusFilter}
            sortBy={sortBy}
            onSearch={(v) => { setSearchInput(v); setPage(1); }}
            onStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
            onSortChange={(v) => { setSortBy(v); setPage(1); }}
          />

          {meta && <PaginationSummary meta={meta} page={page} limit={LIMIT} label="reminders" />}
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
        >
          {view === 'calendar' ? (
            calendarLoading ? (
              <LoadingSpinner message="Loading reminders..." />
            ) : (
              <ReminderCalendarView
                reminders={calendarReminders}
                onAcknowledge={handleAcknowledge}
                onDismiss={handleDismiss}
                onDelete={handleDelete}
                onReschedule={handleReschedule}
                onCreateAt={handleCreateAt}
              />
            )
          ) : loading ? (
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
        </motion.div>
      </AnimatePresence>

      <ReminderCreateModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setCreateAtDate(null);
        }}
        initialData={createAtDate ? { title: '', dueDate: createAtDate } : undefined}
        onSuccess={(created: ReminderResponseDto) => {
          setShowModal(false);
          setCreateAtDate(null);
          if (view === 'calendar') {
            setCalendarReminders((rs) => [...rs, created]);
          } else {
            fetchReminders();
          }
        }}
      />
    </div>
  );
}
