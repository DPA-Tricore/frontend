'use client';

import { CheckSquare, Bell, RefreshCw, Paperclip, Activity as ActivityIcon, type LucideIcon } from 'lucide-react';
import type { TaskResponseDto } from '@/lib/types/tasks';
import type { ReminderResponseDto } from '@/lib/types/reminders';
import type { DocumentResponseDto } from '@/lib/types/documents';
import type { ActivityResponseDto } from '@/lib/types/activities';
import { getStatusColor, getPriorityColor } from '@/lib/theme/colors';
import { formatDate, formatTime } from '@/lib/utils/date';
import { useLeadActivityFeed } from '@/lib/hooks/use-lead-detail';
import EmptyState from '@/components/empty-state';

const FEED_ICONS: Record<string, { icon: LucideIcon; className: string }> = {
  task: { icon: CheckSquare, className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' },
  reminder: { icon: Bell, className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  activity: { icon: RefreshCw, className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  document: { icon: Paperclip, className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
};

interface LeadActivityTabProps {
  leadId: string;
}

export default function LeadActivityTab({ leadId }: LeadActivityTabProps) {
  const { data: feed = [], isLoading } = useLeadActivityFeed(leadId);

  if (isLoading) return <p className="text-sm text-subtle">Loading activity...</p>;

  if (feed.length === 0) {
    return <EmptyState message="No activity yet" icon={<ActivityIcon size={32} className="mx-auto text-subtle" />} />;
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--border)]" />

      <div className="space-y-0">
        {feed.map((item) => {
          const { icon: Icon, className } = FEED_ICONS[item.kind];
          return (
          <div key={item.id} className="relative flex gap-4 pb-6">
            {/* Dot */}
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${className}`}>
              <Icon size={14} />
            </div>

            {/* Content */}
            <div className="flex-1 pt-1 min-w-0">
              {item.kind === 'task' && item.task && (
                <TaskActivity task={item.task} date={item.date} />
              )}
              {item.kind === 'reminder' && item.reminder && (
                <ReminderActivity reminder={item.reminder} date={item.date} />
              )}
              {item.kind === 'document' && item.document && (
                <DocumentActivity document={item.document} date={item.date} />
              )}
              {item.kind === 'activity' && item.activity && (
                <StatusActivity activity={item.activity} date={item.date} />
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskActivity({ task, date }: { task: TaskResponseDto; date: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-primary">Task created</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(task.status)}`}>
          {task.status.replace(/_/g, ' ')}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      <p className="text-sm text-muted mt-0.5">{task.title}</p>
      <p className="text-xs text-subtle mt-1">{formatDate(date)} · Due {formatDate(task.dueDate)}</p>
    </div>
  );
}

function ReminderActivity({ reminder, date }: { reminder: ReminderResponseDto; date: string }) {
  return (
    <div>
      <span className="text-sm font-medium text-primary">Reminder set</span>
      <p className="text-sm text-muted mt-0.5">{reminder.title}</p>
      <p className="text-xs text-subtle mt-1">{formatDate(date)} · Due {formatDate(reminder.dueDate)} at {formatTime(reminder.dueDate)}</p>
    </div>
  );
}

function StatusActivity({ activity, date }: { activity: ActivityResponseDto; date: string }) {
  return (
    <div>
      <span className="text-sm font-medium text-primary">{activity.message ?? activity.action}</span>
      <p className="text-xs text-subtle mt-1">{formatDate(date)} · {formatTime(date)}</p>
    </div>
  );
}

function DocumentActivity({ document, date }: { document: DocumentResponseDto; date: string }) {
  return (
    <div>
      <span className="text-sm font-medium text-primary">Document uploaded</span>
      <p className="text-sm text-muted mt-0.5">{document.originalName}</p>
      <p className="text-xs text-subtle mt-1">{formatDate(date)} · by {document.uploaderName ?? 'Unknown'}</p>
    </div>
  );
}
