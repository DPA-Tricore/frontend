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
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Reminders
        </h3>
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">All caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Reminders
        </h3>
        {reminders.length > 0 && (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {reminders.length} total
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400 font-semibold">
            {overdue.length} Overdue
          </p>
        </div>
        <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
          <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
            {upcoming.length} Upcoming
          </p>
        </div>
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <p className="text-blue-600 dark:text-blue-400 font-semibold">
            {reminders.filter(r => r.status === 'ACKNOWLEDGED').length}{' '}
            Acknowledged
          </p>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {displayReminders.map(reminder => {
          const isOverdue = new Date(reminder.reminderTime) < new Date();

          return (
            <div
              key={reminder.id}
              className={`p-3 rounded-lg border transition-colors ${
                isOverdue
                  ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {isOverdue ? (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {reminder.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {formatRelativeTime(reminder.reminderTime)}
                  </p>
                  {reminder.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                      {reminder.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      {reminders.length > limit && (
        <button
          onClick={onViewAll}
          className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          View All ({reminders.length})
          <ChevronRight size={16} />
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
    if (absMins < 60) {
      return `${absMins}m overdue`;
    }
    const absHours = Math.floor(absMins / 60);
    if (absHours < 24) {
      return `${absHours}h overdue`;
    }
    const absDays = Math.floor(absMins / (60 * 24));
    return `${absDays}d overdue`;
  }

  if (diffMins < 60) {
    return `in ${diffMins}m`;
  }
  if (diffHours < 24) {
    return `in ${diffHours}h`;
  }
  return `in ${diffDays}d`;
}
