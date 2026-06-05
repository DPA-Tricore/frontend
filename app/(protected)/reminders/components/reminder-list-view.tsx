'use client';

import React from 'react';
import { colors } from '@/lib/theme/colors';
import { PaginationMeta } from '@/lib/types/common';
import type { ReminderResponseDto } from '@/lib/types/reminders';
import ReminderListItem from './reminder-list-item';

type SortField = 'reminderTime' | 'dueDate' | 'title' | 'status' | 'createdAt';

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
              {(['title', 'status', 'dueDate', 'reminderTime'] as SortField[]).map((field) => (
                <th
                  key={field}
                  className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                  onClick={() => onSort(field)}
                >
                  <div className="flex items-center gap-2">
                    {field === 'dueDate' ? 'Due Date' : field === 'reminderTime' ? 'Reminder Time' : field.charAt(0).toUpperCase() + field.slice(1)}
                    <SortIcon field={field} sortBy={sortBy} sortOrder={sortOrder} />
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Time Left</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((reminder) => (
              <ReminderListItem
                key={reminder.id}
                reminder={reminder}
                onAcknowledge={onAcknowledge}
                onDismiss={onDismiss}
                onDelete={onDelete}
              />
            ))}
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
