'use client';

import { Plus, RefreshCw, MessageSquare, Paperclip, Activity as ActivityIcon, type LucideIcon } from 'lucide-react';
import type { TaskFeedKind, TaskResponseDto } from '@/lib/types/tasks';
import { formatDate, formatTime } from '@/lib/utils/date';
import { useTaskActivityFeed } from '@/lib/hooks/use-task-detail';
import EmptyState from '@/components/empty-state';

const FEED_ICONS: Record<TaskFeedKind, { icon: LucideIcon; className: string }> = {
  created: { icon: Plus, className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' },
  activity: { icon: RefreshCw, className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  note: { icon: MessageSquare, className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
  document: { icon: Paperclip, className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
};

interface TaskActivityTabProps {
  task: TaskResponseDto;
  getUserName: (id: string) => string;
}

export default function TaskActivityTab({ task, getUserName }: TaskActivityTabProps) {
  const { data: feed, isLoading } = useTaskActivityFeed(task);

  if (isLoading) return <p className="text-sm text-subtle">Loading activity...</p>;

  if (feed.length === 0) {
    return <EmptyState message="No activity yet" icon={<ActivityIcon size={32} className="mx-auto text-subtle" />} />;
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--border)]" />

      <div className="space-y-0">
        {feed.map((item) => {
          const { icon: Icon, className } = FEED_ICONS[item.kind];
          const when = `${formatDate(item.date)} · ${formatTime(item.date)}`;
          return (
            <div key={item.id} className="relative flex gap-4 pb-6">
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${className}`}>
                <Icon size={14} />
              </div>

              <div className="flex-1 pt-1 min-w-0">
                {item.kind === 'created' && (
                  <>
                    <span className="text-sm font-medium text-primary">Task created</span>
                    <p className="text-xs text-subtle mt-1">{when} · by {getUserName(task.createdById)}</p>
                  </>
                )}
                {item.kind === 'activity' && item.activity && (
                  <>
                    <span className="text-sm font-medium text-primary">
                      {item.activity.message ?? item.activity.action}
                    </span>
                    <p className="text-xs text-subtle mt-1">
                      {when}
                      {item.activity.actorId && ` · by ${getUserName(item.activity.actorId)}`}
                    </p>
                  </>
                )}
                {item.kind === 'note' && item.note && (
                  <>
                    <span className="text-sm font-medium text-primary">
                      {item.note.type === 'VOICE' ? 'Voice note added' : 'Note added'}
                    </span>
                    {item.note.type === 'TEXT' && item.note.body && (
                      <p className="text-sm text-muted mt-0.5 line-clamp-2">{item.note.body}</p>
                    )}
                    <p className="text-xs text-subtle mt-1">{when} · by {item.note.authorName ?? 'Unknown'}</p>
                  </>
                )}
                {item.kind === 'document' && item.document && (
                  <>
                    <span className="text-sm font-medium text-primary">Document uploaded</span>
                    <p className="text-sm text-muted mt-0.5 truncate">{item.document.originalName}</p>
                    <p className="text-xs text-subtle mt-1">{when} · by {item.document.uploaderName ?? 'Unknown'}</p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
