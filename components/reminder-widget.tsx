'use client';

import React, { useMemo } from 'react';
import { useReminders } from '@/lib/hooks/use-reminders';
import { Clock, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ReminderWidgetProps {
  limit?: number;
  onViewAll?: () => void;
}

export default function ReminderWidget({
  limit = 5,
  onViewAll,
}: ReminderWidgetProps) {
  const { reminders } = useReminders();

  const { overdue, upcoming } = useMemo(() => {
    const now = new Date();
    const overdue = reminders.filter(
      r =>
        (r.status === 'PENDING' || r.status === 'TRIGGERED') &&
        new Date(r.reminderTime) < now
    );
    const upcoming = reminders.filter(
      r =>
        (r.status === 'PENDING' || r.status === 'TRIGGERED') &&
        new Date(r.reminderTime) >= now
    );

    return {
      overdue: overdue.sort(
        (a, b) =>
          new Date(b.reminderTime).getTime() -
          new Date(a.reminderTime).getTime()
      ),
      upcoming: upcoming.sort(
        (a, b) =>
          new Date(a.reminderTime).getTime() -
          new Date(b.reminderTime).getTime()
      ),
    };
  }, [reminders]);

  const displayReminders = [...overdue, ...upcoming].slice(0, limit);

  if (reminders.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-[var(--border)] surface">
        <h3 className="text-lg font-semibold text-primary mb-4">Reminders</h3>
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">All caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border border-[var(--border)] surface">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary">Reminders</h3>
        <span className="text-sm text-muted">{reminders.length} total</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="p-2 rounded-lg bg-red-500/10">
          <p className="text-red-500 font-semibold">{overdue.length} Overdue</p>
        </div>
        <div className="p-2 rounded-lg bg-yellow-500/10">
          <p className="text-yellow-500 font-semibold">{upcoming.length} Upcoming</p>
        </div>
        <div className="p-2 rounded-lg bg-blue-500/10">
          <p className="text-blue-500 font-semibold">
            {reminders.filter(r => r.status === 'ACKNOWLEDGED').length} Done
          </p>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-2">
        {displayReminders.map(reminder => {
          const isOverdue = new Date(reminder.reminderTime) < new Date();

          return (
            <div
              key={reminder.id}
              className={`p-3 rounded-lg border transition-colors ${
                isOverdue
                  ? 'border-red-500/30 bg-red-500/10'
                  : 'border-[var(--border)] bg-[var(--surface-2)]'
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {isOverdue ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {reminder.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {formatRelativeTime(reminder.reminderTime)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All */}
      {reminders.length > limit && (
        <button
          onClick={onViewAll}
          className="w-full mt-4 px-4 py-2 text-sm font-medium text-muted hover:text-primary hover:bg-[var(--surface-2)] rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          View all {reminders.length} reminders
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 0) {
    const absMins = Math.abs(diffMins);
    if (absMins < 60) return `${absMins}m overdue`;
    const absHours = Math.floor(absMins / 60);
    if (absHours < 24) return `${absHours}h overdue`;
    return `${Math.floor(absMins / (60 * 24))}d overdue`;
  }

  if (diffMins < 60) return `in ${diffMins}m`;
  if (diffHours < 24) return `in ${diffHours}h`;
  return `in ${diffDays}d`;
}
