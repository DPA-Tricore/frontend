'use client';

import type { ReminderResponseDto } from '@/lib/types/reminders';
import { formatDate, formatTime } from '@/lib/utils/date';
import { useLeadReminders } from '@/lib/hooks/use-lead-detail';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  TRIGGERED: 'bg-orange-100 text-orange-800',
  ACKNOWLEDGED: 'bg-green-100 text-green-800',
  DISMISSED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

interface LeadRemindersTabProps {
  leadId: string;
}

export default function LeadRemindersTab({ leadId }: LeadRemindersTabProps) {
  const { data: reminders = [], isLoading } = useLeadReminders(leadId);

  if (isLoading) return <p className="text-sm text-subtle">Loading reminders...</p>;

  if (reminders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🔔</p>
        <p className="text-sm text-subtle">No reminders for this lead</p>
      </div>
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
            {upcoming.map((r) => <ReminderRow key={r.id} reminder={r} />)}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">Past · {past.length}</p>
          <div className="space-y-2 opacity-60">
            {past.map((r) => <ReminderRow key={r.id} reminder={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function ReminderRow({ reminder }: { reminder: ReminderResponseDto }) {
  const isPast = new Date(reminder.dueDate) < new Date();
  return (
    <div className="surface border border-[var(--border)] rounded-lg px-4 py-3 flex items-center gap-3">
      <div className="text-xl">🔔</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{reminder.title}</p>
        {reminder.description && (
          <p className="text-xs text-subtle mt-0.5 truncate">{reminder.description}</p>
        )}
        <span className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[reminder.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {reminder.status}
        </span>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-xs font-medium ${isPast && reminder.status === 'PENDING' ? 'text-red-500' : 'text-primary'}`}>
          {formatDate(reminder.dueDate)}
        </p>
        <p className="text-xs text-subtle">{formatTime(reminder.dueDate)}</p>
      </div>
    </div>
  );
}
