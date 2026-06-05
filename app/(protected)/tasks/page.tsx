'use client';

import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '@/lib/api/tasks';
import { usersApi, UserResponseDto } from '@/lib/api/users';
import type { TaskResponseDto } from '@/lib/types/tasks';
import { PaginationMeta } from '@/lib/types/common';
import { colors } from '@/lib/theme/colors';
import PageHeader from '@/components/page-header';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import PaginationSummary from '@/components/pagination-summary';
import TaskFilters from './components/task-filters';
import TaskListView from './components/task-list-view';
import TaskCreateModal from './components/task-create-modal';

type SortField = 'title' | 'createdAt' | 'dueDate' | 'status' | 'priority' | 'type';

const LIMIT = 10;

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskResponseDto[]>([]);
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        setUsers(await usersApi.getUsers());
      } catch {
        // non-critical, table shows fallback
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
  }, []);

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
    fetchTasks();
  }, [fetchTasks]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const getUserEmail = (userId: string) =>
    users.find((u) => u.id === userId)?.email ?? 'Unknown User';

  return (
    <div className="p-8">
      <PageHeader
        title="Tasks Management"
        subtitle="Track and manage your sales activities"
        error={error}
        actions={
          <button onClick={() => setShowModal(true)} className={colors.button.primary}>
            + Add Task
          </button>
        }
      />

      <TaskFilters
        search={search}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        typeFilter={typeFilter}
        sortBy={sortBy}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        onStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
        onPriorityFilter={(v) => { setPriorityFilter(v); setPage(1); }}
        onTypeFilter={(v) => { setTypeFilter(v); setPage(1); }}
        onSortChange={(v) => { setSortBy(v); setPage(1); }}
      />

      {meta && <PaginationSummary meta={meta} page={page} limit={LIMIT} label="tasks" />}

      {loading ? (
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
          getUserEmail={getUserEmail}
        />
      )}

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
