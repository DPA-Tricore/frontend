import { Bell } from 'lucide-react';
import type { ReminderResponseDto } from '@/lib/types/reminders';
import { getReminderStatusColor } from '@/lib/theme/colors';
import { formatDate, formatTime } from '@/lib/utils/date';

/** Shows when the reminder fires (reminderTime), not when the underlying item is due. */
export default function TaskReminderRow({ reminder }: { reminder: ReminderResponseDto }) {
  const isPast = new Date(reminder.reminderTime) < new Date();
  return (
    <div className="surface border border-[var(--border)] rounded-lg px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        <Bell size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{reminder.title}</p>
        {reminder.description && (
          <p className="text-xs text-subtle mt-0.5 truncate">{reminder.description}</p>
        )}
        <span className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${getReminderStatusColor(reminder.status)}`}>
          {reminder.status}
        </span>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-xs font-medium ${isPast && reminder.status === 'PENDING' ? 'text-red-500' : 'text-primary'}`}>
          {formatDate(reminder.reminderTime)}
        </p>
        <p className="text-xs text-subtle">{formatTime(reminder.reminderTime)}</p>
      </div>
    </div>
  );
}
