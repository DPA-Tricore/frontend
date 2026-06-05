'use client';

import React from 'react';
import { PaginationMeta } from '@/lib/types/common';
import type { ReminderResponseDto } from '@/lib/types/reminders';
import Pagination from '@/components/pagination';
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

      {meta && <Pagination meta={meta} page={page} onPageChange={onPageChange} />}
    </div>
  );
}
