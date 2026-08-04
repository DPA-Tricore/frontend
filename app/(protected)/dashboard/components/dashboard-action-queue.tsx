'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { AlertCircle, CheckSquare, Clock } from 'lucide-react';
import { useReminders } from '@/lib/hooks/use-reminders';
import type { TaskResponseDto } from '@/lib/types/tasks';

interface Props {
  dueTasks: TaskResponseDto[];
}

function relativeLabel(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  const mins = Math.round(diff / 60000);
  if (mins >= 0) {
    if (mins < 60) return `in ${mins}m`;
    const h = Math.floor(mins / 60);
    return h < 24 ? `in ${h}h` : `in ${Math.floor(h / 24)}d`;
  }
  const abs = Math.abs(mins);
  if (abs < 60) return `${abs}m overdue`;
  const h = Math.floor(abs / 60);
  return h < 24 ? `${h}h overdue` : `${Math.floor(h / 24)}d overdue`;
}

function taskDueLabel(dueDate: Date | string): string {
  const time = dueDate instanceof Date ? dueDate.getTime() : new Date(dueDate).getTime();
  const diffDays = Math.floor((time - Date.now()) / 86400000);
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return `Due in ${diffDays}d`;
}

export default function DashboardActionQueue({ dueTasks }: Props) {
  const { reminders } = useReminders();

  const { overdueReminders, upcomingReminders } = useMemo(() => {
    const now = Date.now();
    const active = reminders.filter(r => r.status === 'PENDING' || r.status === 'TRIGGERED');
    return {
      overdueReminders: active
        .filter(r => new Date(r.reminderTime).getTime() < now)
        .sort((a, b) => new Date(b.reminderTime).getTime() - new Date(a.reminderTime).getTime())
        .slice(0, 4),
      upcomingReminders: active
        .filter(r => new Date(r.reminderTime).getTime() >= now)
        .sort((a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime())
        .slice(0, 2),
    };
  }, [reminders]);

  const isEmpty =
    overdueReminders.length === 0 &&
    dueTasks.length === 0 &&
    upcomingReminders.length === 0;

  if (isEmpty) {
    return (
      <p className="text-sm text-muted text-center py-8">All caught up!</p>
    );
  }

  return (
    <div className="space-y-5">
      {overdueReminders.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Overdue Reminders
            </p>
            <Link href="/reminders" className="text-xs text-muted hover:text-primary transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-1.5">
            {overdueReminders.map(r => (
              <div
                key={r.id}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-red-500/20 bg-red-500/8"
              >
                <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-primary truncate">{r.title}</p>
                  <p className="text-xs text-muted">{relativeLabel(r.reminderTime)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {dueTasks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Tasks Due
            </p>
            <Link href="/tasks" className="text-xs text-muted hover:text-primary transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-1.5">
            {dueTasks.map(task => (
              <div
                key={task.id}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]"
              >
                <CheckSquare size={13} className="text-muted flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-primary truncate">{task.title}</p>
                  <p className="text-xs text-muted">{taskDueLabel(task.dueDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcomingReminders.length > 0 && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
            Upcoming
          </p>
          <div className="space-y-1.5">
            {upcomingReminders.map(r => (
              <div
                key={r.id}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-[var(--border)]"
              >
                <Clock size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-primary truncate">{r.title}</p>
                  <p className="text-xs text-muted">{relativeLabel(r.reminderTime)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
