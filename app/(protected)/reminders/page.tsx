'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle, Trash2, Bell } from 'lucide-react';
import { reminderAPI, PaginationMeta } from '@/lib/api/reminders';
import { ReminderResponseDto } from '@/lib/api/types/reminder-types';
import ReminderModal from '@/components/reminder-modal';
import { colors } from '@/lib/theme/colors';

const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  PENDING: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: <Clock className="w-4 h-4" />,
  },
  TRIGGERED: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  ACKNOWLEDGED: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  DISMISSED: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: <XCircle className="w-4 h-4" />,
  },
  CANCELLED: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: <XCircle className="w-4 h-4" />,
  },
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderResponseDto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'reminderTime' | 'dueDate' | 'title' | 'status' | 'createdAt'>(
    'reminderTime',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reminderAPI.list({
        page,
        limit,
        ...(search && { search }),
        sortBy,
        sortOrder,
        ...(statusFilter && { status: statusFilter }),
      });

      setReminders(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err) {
      setError('Failed to fetch reminders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      try {
        await reminderAPI.delete(id);
        await fetchReminders();
      } catch (err) {
        console.error('Failed to delete reminder:', err);
        alert('Failed to delete reminder');
      }
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await reminderAPI.acknowledge(id);
      await fetchReminders();
    } catch (err) {
      console.error('Failed to acknowledge reminder:', err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await reminderAPI.dismiss(id);
      await fetchReminders();
    } catch (err) {
      console.error('Failed to dismiss reminder:', err);
    }
  };

  const handleSort = (field: 'reminderTime' | 'dueDate' | 'title' | 'status' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <span className="text-subtle">⇅</span>;
    return <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string | Date | undefined) => {
    if (!date) return '—';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeLeft = (reminderTime: string | Date) => {
    const now = new Date();
    const reminder = new Date(reminderTime);
    const diff = reminder.getTime() - now.getTime();

    if (diff < 0) return 'Overdue';
    if (diff < 60000) return 'In a few seconds';
    if (diff < 3600000) return `In ${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `In ${Math.floor(diff / 3600000)}h`;
    return `In ${Math.floor(diff / 86400000)}d`;
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Reminders</h1>
            <p className="text-muted mt-1">Manage your reminders and notifications</p>
          </div>
          <button onClick={() => setShowModal(true)} className={colors.button.primary}>
            + Add Reminder
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Filters */}
        <div className="surface rounded-lg border border-[var(--border)] p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 surface text-primary"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 surface text-primary"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="TRIGGERED">Triggered</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="DISMISSED">Dismissed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'reminderTime' | 'dueDate' | 'title' | 'status' | 'createdAt')
                }
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 surface text-primary"
              >
                <option value="reminderTime">Reminder Time</option>
                <option value="dueDate">Due Date</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
                <option value="createdAt">Created At</option>
              </select>
            </div>
          </div>

          {/* Sort Order Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 text-sm surface border border-[var(--border)] text-primary rounded-md hover:opacity-70 transition-colors"
            >
              Order: {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>

        {/* Results Count */}
        {meta ? (
          <div className="mb-4 text-sm text-muted">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total} reminders
          </div>
        ) : null}

        {/* Reminders List */}
        {loading ? (
          <div className="text-center py-12">
            <svg
              className="animate-spin h-8 w-8 mx-auto text-primary mb-4"
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
            <p className="text-muted">Loading reminders...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-12 surface rounded-lg border border-[var(--border)]">
            <Bell className="w-12 h-12 text-subtle mx-auto mb-4" />
            <p className="text-muted">
              {search ? 'No reminders found. Try adjusting your search.' : 'No reminders yet. Create your first one!'}
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Reminder Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Time Left</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.map((reminder) => (
                    <tr key={reminder.id} className="border-b border-[var(--border)] hover:[background:var(--bg)]">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-primary">{reminder.title}</div>
                        {reminder.description && (
                          <div className="text-xs text-subtle mt-1 line-clamp-2">{reminder.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[reminder.status]?.bg} ${statusColors[reminder.status]?.text}`}>
                            {statusColors[reminder.status]?.icon}
                            {reminder.status}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted">{formatDate(reminder.dueDate)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted">
                          {formatDate(reminder.reminderTime)} {formatTime(reminder.reminderTime)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted">{getTimeLeft(reminder.reminderTime)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {(reminder.status === 'PENDING' || reminder.status === 'TRIGGERED') && (
                            <>
                              <button
                                onClick={() => handleAcknowledge(reminder.id)}
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                              >
                                Acknowledge
                              </button>
                              <button
                                onClick={() => handleDismiss(reminder.id)}
                                className="text-xs px-2 py-1 surface border border-[var(--border)] text-primary rounded hover:opacity-70 transition-colors"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(reminder.id)}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 ? (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-muted">
                  Page {meta.page} of {meta.totalPages}
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!meta.hasPrevPage}
                    className="px-4 py-2 border border-[var(--border)] text-primary rounded-md hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {(() => {
                      const pages: React.ReactNode[] = [];
                      const maxPagesToShow = 7;
                      let startPage = Math.max(1, meta.page - Math.floor(maxPagesToShow / 2));
                      const endPage = Math.min(meta.totalPages, startPage + maxPagesToShow - 1);

                      if (endPage - startPage + 1 < maxPagesToShow) {
                        startPage = Math.max(1, endPage - maxPagesToShow + 1);
                      }

                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => setPage(1)}
                            className="px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-primary hover:opacity-70"
                          >
                            1
                          </button>,
                        );
                        if (startPage > 2) {
                          pages.push(
                            <span key="dots-start" className="px-2 py-2 text-subtle">
                              ...
                            </span>,
                          );
                        }
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={
                              i === meta.page
                                ? 'px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white'
                                : 'px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-primary hover:opacity-70'
                            }
                          >
                            {i}
                          </button>,
                        );
                      }

                      if (endPage < meta.totalPages) {
                        if (endPage < meta.totalPages - 1) {
                          pages.push(
                            <span key="dots-end" className="px-2 py-2 text-subtle">
                              ...
                            </span>,
                          );
                        }
                        pages.push(
                          <button
                            key={meta.totalPages}
                            onClick={() => setPage(meta.totalPages)}
                            className="px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-primary hover:opacity-70"
                          >
                            {meta.totalPages}
                          </button>,
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!meta.hasNextPage}
                    className="px-4 py-2 border border-[var(--border)] text-primary rounded-md hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Reminder Modal */}
        {showModal && (
          <ReminderModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              fetchReminders();
            }}
          />
        )}
      </div>
    </div>
  );
}

