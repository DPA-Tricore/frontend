'use client';

import React from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { colors } from '@/lib/theme/colors';
import { formatDate, formatTime, getTimeLeft } from '@/lib/utils/date';
import { PaginationMeta } from '@/lib/types/common';
import type { ReminderResponseDto, ReminderStatus } from '@/lib/types/reminders';

type SortField = 'reminderTime' | 'dueDate' | 'title' | 'status' | 'createdAt';

const statusConfig: Record<ReminderStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
  TRIGGERED: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle className="w-4 h-4" /> },
  ACKNOWLEDGED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
  DISMISSED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <XCircle className="w-4 h-4" /> },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <XCircle className="w-4 h-4" /> },
};

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: 'asc' | 'desc' }) {
  if (sortBy !== field) return <span className="text-subtle">⇅</span>;
  return <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
}

interface ReminderListViewProps {
  reminders: ReminderResponseDto[];
  meta: PaginationMeta | null;
  page: number;
  sortBy: SortField;
  sortOrder: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  onPageChange: (page: number) => void;
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ReminderListView({
  reminders,
  meta,
  page,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onAcknowledge,
  onDismiss,
  onDelete,
}: ReminderListViewProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto surface rounded-lg border border-[var(--border)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] [background:var(--bg)]">
              <th
                className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                onClick={() => onSort('title')}
              >
                <div className="flex items-center gap-2">
                  Title
                  <SortIcon field="title" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="status" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                onClick={() => onSort('dueDate')}
              >
                <div className="flex items-center gap-2">
                  Due Date
                  <SortIcon field="dueDate" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                onClick={() => onSort('reminderTime')}
              >
                <div className="flex items-center gap-2">
                  Reminder Time
                  <SortIcon field="reminderTime" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Time Left</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((reminder) => {
              const status = statusConfig[reminder.status];
              return (
                <tr key={reminder.id} className="border-b border-[var(--border)] hover:[background:var(--bg)]">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-primary">{reminder.title}</div>
                    {reminder.description && (
                      <div className="text-xs text-subtle mt-1 line-clamp-2">{reminder.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                      {status.icon}
                      {reminder.status}
                    </span>
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
                            onClick={() => onAcknowledge(reminder.id)}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => onDismiss(reminder.id)}
                            className="text-xs px-2 py-1 surface border border-[var(--border)] text-primary rounded hover:opacity-70 transition-colors"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onDelete(reminder.id)}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted">
            Page {meta.page} of {meta.totalPages}
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={!meta.hasPrevPage}
              className={colors.pagination.button}
            >
              ← Previous
            </button>

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
                    <button key={1} onClick={() => onPageChange(1)} className={colors.pagination.inactive}>1</button>,
                  );
                  if (startPage > 2) {
                    pages.push(<span key="dots-start" className="px-2 py-2 text-subtle">...</span>);
                  }
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => onPageChange(i)}
                      className={i === meta.page ? colors.pagination.active : colors.pagination.inactive}
                    >
                      {i}
                    </button>,
                  );
                }

                if (endPage < meta.totalPages) {
                  if (endPage < meta.totalPages - 1) {
                    pages.push(<span key="dots-end" className="px-2 py-2 text-subtle">...</span>);
                  }
                  pages.push(
                    <button key={meta.totalPages} onClick={() => onPageChange(meta.totalPages)} className={colors.pagination.inactive}>
                      {meta.totalPages}
                    </button>,
                  );
                }

                return pages;
              })()}
            </div>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!meta.hasNextPage}
              className={colors.pagination.button}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
