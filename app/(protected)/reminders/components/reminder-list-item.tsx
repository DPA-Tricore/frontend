'use client';

import React from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { formatDate, formatTime, getTimeLeft } from '@/lib/utils/date';
import type { ReminderResponseDto, ReminderStatus } from '@/lib/types/reminders';

const statusConfig: Record<ReminderStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  PENDING:      { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
  TRIGGERED:    { bg: 'bg-red-100',    text: 'text-red-800',    icon: <AlertCircle className="w-4 h-4" /> },
  ACKNOWLEDGED: { bg: 'bg-blue-100',   text: 'text-blue-800',   icon: <CheckCircle className="w-4 h-4" /> },
  DISMISSED:    { bg: 'bg-gray-100',   text: 'text-gray-800',   icon: <XCircle className="w-4 h-4" /> },
  CANCELLED:    { bg: 'bg-gray-100',   text: 'text-gray-800',   icon: <XCircle className="w-4 h-4" /> },
};

interface ReminderListItemProps {
  reminder: ReminderResponseDto;
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ReminderListItem({
  reminder,
  onAcknowledge,
  onDismiss,
  onDelete,
}: ReminderListItemProps) {
  const status = statusConfig[reminder.status];
  const isActionable = reminder.status === 'PENDING' || reminder.status === 'TRIGGERED';

  return (
    <tr className="border-b border-[var(--border)] hover:[background:var(--bg)]">
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
          {isActionable && (
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
}
