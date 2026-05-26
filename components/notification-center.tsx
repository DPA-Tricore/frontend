'use client';

import React, { useState } from 'react';
import { useReminders } from '@/lib/hooks/use-reminders';
import { ReminderResponseDto } from '@/lib/api/reminders';
import { X, Clock, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

interface NotificationCenterProps {
  onClose: () => void;
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { reminders, acknowledgeReminder, dismissReminder, deleteReminder } =
    useReminders();
  const [filter, setFilter] = useState<'all' | 'pending' | 'triggered'>(
    'pending'
  );

  const filteredReminders = reminders.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'PENDING';
    if (filter === 'triggered') return r.status === 'TRIGGERED';
    return true;
  });

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeReminder(id);
    } catch (error) {
      console.error('Failed to acknowledge reminder:', error);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissReminder(id);
    } catch (error) {
      console.error('Failed to dismiss reminder:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReminder(id);
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TRIGGERED':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'ACKNOWLEDGED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (reminderTime: string) => {
    return new Date(reminderTime) < new Date();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md surface shadow-lg overflow-y-auto">
        <div className="sticky top-0 surface border-b border-[var(--border)] p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">
            Notifications
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary interactive"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-[var(--border)] px-4 pt-4 pb-0">
          <div className="flex gap-4">
            {(['all', 'pending', 'triggered'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors capitalize ${
                  filter === f
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-muted hover:text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Reminders List */}
        <div className="p-4">
          {filteredReminders.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-subtle mx-auto mb-3" />
              <p className="text-muted">
                No {filter} reminders
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReminders.map(reminder => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  isOverdue={isOverdue(reminder.reminderTime)}
                  formatDate={formatDate}
                  getStatusIcon={getStatusIcon}
                  onAcknowledge={() => handleAcknowledge(reminder.id)}
                  onDismiss={() => handleDismiss(reminder.id)}
                  onDelete={() => handleDelete(reminder.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReminderCardProps {
  reminder: ReminderResponseDto;
  isOverdue: boolean;
  formatDate: (date: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  onAcknowledge: () => void;
  onDismiss: () => void;
  onDelete: () => void;
}

function ReminderCard({
  reminder,
  isOverdue,
  formatDate,
  getStatusIcon,
  onAcknowledge,
  onDismiss,
  onDelete,
}: ReminderCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => void) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        isOverdue
          ? 'border-red-200 bg-red-50'
          : 'border-[var(--border)] [background:var(--bg)]'
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">{getStatusIcon(reminder.status)}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-primary truncate">
                {reminder.title}
              </h3>
              {reminder.description && (
                <p className="text-sm text-muted line-clamp-2">
                  {reminder.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-muted">
            <Clock size={12} />
            <span>
              Due: {formatDate(reminder.dueDate)}
            </span>
            {isOverdue && <span className="text-red-600 font-semibold">Overdue</span>}
          </div>

          <div className="mt-3 flex gap-2">
            {reminder.status === 'PENDING' || reminder.status === 'TRIGGERED' ? (
              <>
                <button
                  onClick={() => handleAction(onAcknowledge)}
                  disabled={isLoading}
                  className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                >
                  Acknowledge
                </button>
                <button
                  onClick={() => handleAction(onDismiss)}
                  disabled={isLoading}
                  className="text-xs px-2 py-1 rounded surface border border-[var(--border)] text-primary hover:opacity-70 disabled:opacity-50"
                >
                  Dismiss
                </button>
              </>
            ) : null}

            <button
              onClick={() => handleAction(onDelete)}
              disabled={isLoading}
              className="ml-auto text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
