'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Bell } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { ReminderResponseDto } from '@/lib/types/reminders';
import { colors } from '@/lib/theme/colors';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import {
  useRemindersList,
  useRemindersCalendar,
  useAcknowledgeReminder,
  useDismissReminder,
  useDeleteReminder,
  useRescheduleReminder,
} from '@/lib/hooks/use-reminders-page';
import { reminderKeys } from '@/lib/queries/keys';
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

export default function RemindersPage() {
  const searchParams = useSearchParams();
  const view: ViewMode = searchParams.get('view') === 'list' ? 'list' : 'calendar';
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [createAtDate, setCreateAtDate] = useState<Date | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [sortBy, setSortBy] = useState<SortField>('reminderTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState('');

  const {
    data: listData,
    isLoading: loading,
    isError: listErrored,
  } = useRemindersList(
    {
      page,
      limit: LIMIT,
      ...(search && { search }),
      sortBy,
      sortOrder,
      ...(statusFilter && { status: statusFilter }),
    },
    { enabled: view === 'list' },
  );
  const reminders = listData?.data ?? [];
  const meta = listData?.meta ?? null;

  const {
    data: calendarReminders = [],
    isLoading: calendarLoading,
    isError: calendarErrored,
  } = useRemindersCalendar({ enabled: view === 'calendar' });

  const error = listErrored || calendarErrored ? 'Failed to fetch reminders' : null;

  const acknowledgeReminder = useAcknowledgeReminder();
  const dismissReminder = useDismissReminder();
  const deleteReminder = useDeleteReminder();
  const rescheduleReminder = useRescheduleReminder();

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleAcknowledge = (id: string) => acknowledgeReminder.mutate(id);
  const handleDismiss = (id: string) => dismissReminder.mutate(id);
  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    deleteReminder.mutate(id);
  };
  const handleReschedule = (id: string, reminderTime: string) => {
    rescheduleReminder.mutate({ id, reminderTime });
  };

  const handleCreateAt = (atDate: Date) => {
    setCreateAtDate(atDate);
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Reminders"
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
            queryClient.setQueryData<ReminderResponseDto[]>(reminderKeys.calendar(), (old) =>
              old ? [...old, created] : [created],
            );
          } else {
            queryClient.invalidateQueries({ queryKey: [...reminderKeys.all, 'list'] });
          }
        }}
      />
    </div>
  );
}
