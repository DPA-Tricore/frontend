'use client';

import { useState, useEffect, useCallback } from 'react';
import { axiosClient } from '@/lib/api/axios-client';
import { tasksApi, TaskResponseDto } from '@/lib/api/tasks';
import { usersApi, UserResponseDto } from '@/lib/api/users';
import SlideModal from '@/components/slide-modal';
import VoiceRecorder from '@/components/voice-recorder';
import { colors, getStatusColor } from '@/lib/theme/colors';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginatedResponse {
  data: TaskResponseDto[];
  meta: PaginationMeta;
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString();
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-100 text-red-800';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800';
    case 'MEDIUM':
      return 'bg-blue-100 text-blue-800';
    case 'LOW':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getTaskTypeColor(type: string): string {
  switch (type) {
    case 'CALL':
      return 'bg-purple-100 text-purple-800';
    case 'EMAIL':
      return 'bg-green-100 text-green-800';
    case 'MEETING':
      return 'bg-blue-100 text-blue-800';
    case 'FOLLOW_UP':
      return 'bg-yellow-100 text-yellow-800';
    case 'CUSTOM':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

const REMINDER_PRESETS = [
  { label: 'At due time', offset: 0 },
  { label: '15 min before', offset: 15 },
  { label: '30 min before', offset: 30 },
  { label: '1 hour before', offset: 60 },
  { label: '3 hours before', offset: 180 },
  { label: '1 day before', offset: 1440 },
  { label: '2 days before', offset: 2880 },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskResponseDto[]>([]);
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<
    'title' | 'createdAt' | 'dueDate' | 'status' | 'priority' | 'type'
  >('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'CALL',
    priority: 'MEDIUM',
    assignedToId: '',
    dueDate: '',
  });

  // Reminder state
  const [selectedOffsets, setSelectedOffsets] = useState<number[]>([]);
  const [customReminderTimes, setCustomReminderTimes] = useState<string[]>([]);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);

  const toggleOffset = (offset: number) => {
    setSelectedOffsets((prev) =>
      prev.includes(offset) ? prev.filter((o) => o !== offset) : [...prev, offset],
    );
  };

  const addCustomTime = () => {
    if (customTimeInput && !customReminderTimes.includes(customTimeInput)) {
      setCustomReminderTimes((prev) => [...prev, customTimeInput]);
      setCustomTimeInput('');
    }
  };

  const removeCustomTime = (time: string) => {
    setCustomReminderTimes((prev) => prev.filter((t) => t !== time));
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', type: 'CALL', priority: 'MEDIUM', assignedToId: '', dueDate: '' });
    setSelectedOffsets([]);
    setCustomReminderTimes([]);
    setCustomTimeInput('');
    setDemoMode(false);
    setVoiceBlob(null);
  };

  // Load users for dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        const data = await usersApi.getUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(search && { search }),
        sortBy,
        sortOrder,
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(typeFilter && { type: typeFilter }),
      };

      const response = await tasksApi.getTasks(params);

      if ((response as any).data) {
        setTasks((response as any).data);
        setMeta((response as any).meta);
      } else {
        setTasks(response as any);
        setMeta(null);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, statusFilter, priorityFilter, typeFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dueDate = new Date(formData.dueDate);
      await tasksApi.createTask({
        ...formData,
        dueDate,
        ...(selectedOffsets.length > 0 && { reminderOffsets: selectedOffsets }),
        ...(customReminderTimes.length > 0 && {
          customReminderTimes: customReminderTimes.map((t) => new Date(t).toISOString()),
        }),
        ...(demoMode && { demoMode: true }),
      });
      resetForm();
      setShowForm(false);
      setPage(1);
      fetchTasks();
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field as any);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <span className="text-subtle">⇅</span>;
    return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  const getUserEmail = (userId: string) => {
    return users.find((u) => u.id === userId)?.email || 'Unknown User';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Tasks Management</h1>
          <p className="text-muted mt-2">Track and manage your sales activities</p>
        </div>
        <button onClick={() => setShowForm(true)} className={colors.button.primary}>
          + Add Task
        </button>
      </div>

      {/* Error Message */}
      {error ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      ) : null}

      {/* Add Task Modal */}
      <SlideModal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Create New Task">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              placeholder="e.g., Follow up with client"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              placeholder="Task details..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              >
                <option value="CALL">Call</option>
                <option value="EMAIL">Email</option>
                <option value="MEETING">Meeting</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Assign To * {usersLoading && <span className="text-xs text-subtle">(Loading...)</span>}
            </label>
            <select
              name="assignedToId"
              value={formData.assignedToId}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Due Date *</label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            />
          </div>

          {/* Reminders */}
          <div>
            <label className="block text-sm font-medium text-muted mb-3">
              Reminders <span className="text-xs text-subtle font-normal">(optional, select multiple)</span>
            </label>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {REMINDER_PRESETS.map(({ label, offset }) => {
                const active = selectedOffsets.includes(offset);
                return (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => toggleOffset(offset)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-[var(--border)] text-muted hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Custom datetime picker */}
            <div className="flex gap-2 items-center">
              <input
                type="datetime-local"
                value={customTimeInput}
                onChange={(e) => setCustomTimeInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              />
              <button
                type="button"
                onClick={addCustomTime}
                disabled={!customTimeInput}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-muted hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + Custom
              </button>
            </div>

            {/* Added custom times */}
            {customReminderTimes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {customReminderTimes.map((time) => (
                  <span
                    key={time}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white"
                  >
                    {formatDateTime(time)}
                    <button
                      type="button"
                      onClick={() => removeCustomTime(time)}
                      className="hover:opacity-70 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Demo mode */}
            {(selectedOffsets.length > 0 || customReminderTimes.length > 0) && (
              <label className="inline-flex items-center gap-2 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  className="w-4 h-4 rounded accent-orange-500"
                />
                <span className="text-xs text-orange-600 font-medium">
                  Fire immediately (demo mode)
                </span>
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Voice Note (Optional)</label>
            <VoiceRecorder
              onVoiceRecorded={(blob) => setVoiceBlob(blob)}
              onVoiceCleared={() => setVoiceBlob(null)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className={colors.button.secondary}
            >
              Cancel
            </button>
            <button type="submit" className={colors.button.primary}>
              Create Task
            </button>
          </div>
        </form>
      </SlideModal>

      {/* Search and Filter Bar */}
      <div className="mb-6 surface rounded-lg border border-[var(--border)] p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
            >
              <option value="">Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
            >
              <option value="">Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
            >
              <option value="">Type</option>
              <option value="CALL">Call</option>
              <option value="EMAIL">Email</option>
              <option value="MEETING">Meeting</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
            >
              <option value="dueDate">Due Date</option>
              <option value="title">Title</option>
              <option value="createdAt">Created</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {meta ? (
        <div className="mb-4 text-sm text-muted">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total}{' '}
          tasks
        </div>
      ) : null}

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-12">
          <svg
            className={`animate-spin h-8 w-8 mx-auto ${colors.text.primary} mb-4`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-muted">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 surface rounded-lg border border-[var(--border)]">
          <p className="text-muted">
            No tasks found. {search ? 'Try adjusting your search.' : 'Create your first task to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto surface rounded-lg border border-[var(--border)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] [background:var(--bg)]">
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Title
                      <SortIcon field="title" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Priority</th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex items-center gap-2">
                      Due Date
                      <SortIcon field="dueDate" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-[var(--border)] hover:[background:var(--bg)]">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-primary">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-subtle mt-1 line-clamp-2">{task.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                        {task.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          task.status,
                        )}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted">{formatDate(task.dueDate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted">{getUserEmail(task.assignedToId)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={!meta.hasPrevPage}
            className={`px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] ${
              meta.hasPrevPage
                ? 'text-primary hover:opacity-70'
                : 'text-subtle cursor-not-allowed opacity-50'
            }`}
          >
            Previous
          </button>
          <div className="text-sm text-muted">
            Page {page} of {meta.totalPages}
          </div>
          <button
            onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
            disabled={!meta.hasNextPage}
            className={`px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] ${
              meta.hasNextPage
                ? 'text-primary hover:opacity-70'
                : 'text-subtle cursor-not-allowed opacity-50'
            }`}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
