'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { tasksApi } from '@/lib/api/tasks';
import type { TaskResponseDto } from '@/lib/types/tasks';
import { PaginationMeta } from '@/lib/types/common';
import { colors } from '@/lib/theme/colors';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useUsers } from '@/lib/hooks/use-users';
import PageHeader from '@/components/page-header';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import PaginationSummary from '@/components/pagination-summary';
import TaskFilters from './components/task-filters';
import TaskListView from './components/task-list-view';
import TaskBoardView from './components/task-board-view';
import TaskCreateModal from '@/components/tasks/task-create-modal';
import ViewToggle, { type ViewMode } from './components/view-toggle';
import { userDisplayName } from '@/lib/utils/user-name';

type SortField = 'title' | 'createdAt' | 'dueDate' | 'status' | 'priority' | 'type';

const LIMIT = 10;

export default function TasksPage() {
  const searchParams = useSearchParams();
  const view: ViewMode = searchParams.get('view') === 'list' ? 'list' : 'board';

  const [tasks, setTasks] = useState<TaskResponseDto[]>([]);
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [sortBy, setSortBy] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await tasksApi.getTasks({
        page,
        limit: LIMIT,
        ...(search && { search }),
        sortBy,
        sortOrder,
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(typeFilter && { type: typeFilter }),
      });
      if ((response as any).data) {
        setTasks((response as any).data);
        setMeta((response as any).meta);
      } else {
        setTasks(response as any);
        setMeta(null);
      }
      setError(null);
    } catch {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, sortOrder, statusFilter, priorityFilter, typeFilter]);

  useEffect(() => {
    if (view === 'list') fetchTasks();
  }, [fetchTasks, view]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? userDisplayName(user) : 'Unknown User';
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Tasks"
        error={error}
        actions={
          <>
            <ViewToggle />
            <button onClick={() => setShowModal(true)} className={colors.button.primary}>
              + Add Task
            </button>
          </>
        }
      />

      {view === 'list' && (
        <>
          <TaskFilters
            search={searchInput}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            typeFilter={typeFilter}
            sortBy={sortBy}
            onSearch={(v) => { setSearchInput(v); setPage(1); }}
            onStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
            onPriorityFilter={(v) => { setPriorityFilter(v); setPage(1); }}
            onTypeFilter={(v) => { setTypeFilter(v); setPage(1); }}
            onSortChange={(v) => { setSortBy(v); setPage(1); }}
          />
          {meta && <PaginationSummary meta={meta} page={page} limit={LIMIT} label="tasks" />}
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
          {view === 'board' ? (
            <TaskBoardView users={users} />
          ) : loading ? (
            <LoadingSpinner message="Loading tasks..." />
          ) : tasks.length === 0 ? (
            <EmptyState
              message={search ? 'No tasks found. Try adjusting your search.' : 'Create your first task to get started!'}
            />
          ) : (
            <TaskListView
              tasks={tasks}
              meta={meta}
              page={page}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onPageChange={setPage}
              getUserName={getUserName}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <TaskCreateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => { setShowModal(false); setPage(1); fetchTasks(); }}
        users={users}
        usersLoading={usersLoading}
      />
    </div>
  );
}
