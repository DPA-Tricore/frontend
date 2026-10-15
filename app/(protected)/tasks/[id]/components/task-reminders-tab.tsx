'use client';

import { Bell } from 'lucide-react';
import { useTaskReminders } from '@/lib/hooks/use-task-detail';
import EmptyState from '@/components/empty-state';
import TaskReminderRow from './task-reminder-row';

interface TaskRemindersTabProps {
  taskId: string;
}

export default function TaskRemindersTab({ taskId }: TaskRemindersTabProps) {
  const { data: reminders = [], isLoading } = useTaskReminders(taskId);

  if (isLoading) return <p className="text-sm text-subtle">Loading reminders...</p>;

  if (reminders.length === 0) {
    return (
      <EmptyState
        message="No reminders for this task"
        icon={<Bell size={32} className="mx-auto text-subtle" />}
      />
    );
  }

  const upcoming = reminders.filter((r) => r.status === 'PENDING' || r.status === 'TRIGGERED');
  const past = reminders.filter((r) => r.status !== 'PENDING' && r.status !== 'TRIGGERED');

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">Upcoming · {upcoming.length}</p>
          <div className="space-y-2">
            {upcoming.map((r) => <TaskReminderRow key={r.id} reminder={r} />)}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">Past · {past.length}</p>
          <div className="space-y-2 opacity-60">
            {past.map((r) => <TaskReminderRow key={r.id} reminder={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
