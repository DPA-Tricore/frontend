'use client';

import { useState, useEffect } from 'react';
import { tasksApi } from '@/lib/api/tasks';
import { reminderAPI } from '@/lib/api/reminders';
import { documentsApi } from '@/lib/api/documents';
import type { TaskResponseDto } from '@/lib/types/tasks';
import type { ReminderResponseDto } from '@/lib/types/reminders';
import type { DocumentResponseDto } from '@/lib/types/documents';
import { getStatusColor, getPriorityColor } from '@/lib/theme/colors';
import { formatDate, formatTime } from '@/lib/utils/date';

type ActivityKind = 'task' | 'reminder' | 'document';

interface ActivityItem {
  id: string;
  kind: ActivityKind;
  date: string;
  task?: TaskResponseDto;
  reminder?: ReminderResponseDto;
  document?: DocumentResponseDto;
}

function buildFeed(
  tasks: TaskResponseDto[],
  reminders: ReminderResponseDto[],
  documents: DocumentResponseDto[],
): ActivityItem[] {
  const items: ActivityItem[] = [
    ...tasks.map((t) => ({ id: `task-${t.id}`, kind: 'task' as const, date: String(t.createdAt), task: t })),
    ...reminders.map((r) => ({ id: `rem-${r.id}`, kind: 'reminder' as const, date: r.createdAt, reminder: r })),
    ...documents.map((d) => ({ id: `doc-${d.id}`, kind: 'document' as const, date: d.createdAt, document: d })),
  ];
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

interface LeadActivityTabProps {
  leadId: string;
}

export default function LeadActivityTab({ leadId }: LeadActivityTabProps) {
  const [feed, setFeed] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tasksApi.getTasksByLeadId(leadId).catch(() => [] as TaskResponseDto[]),
      reminderAPI.list({ leadId, limit: 50 }).then((r) => r.data).catch(() => [] as ReminderResponseDto[]),
      documentsApi.getLeadDocuments(leadId).catch(() => [] as DocumentResponseDto[]),
    ]).then(([tasks, reminders, documents]) => {
      setFeed(buildFeed(tasks, reminders, documents));
    }).finally(() => setLoading(false));
  }, [leadId]);

  if (loading) return <p className="text-sm text-subtle">Loading activity...</p>;

  if (feed.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm text-subtle">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--border)]" />

      <div className="space-y-0">
        {feed.map((item, i) => (
          <div key={item.id} className="relative flex gap-4 pb-6">
            {/* Dot */}
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm
              ${item.kind === 'task' ? 'bg-purple-100' : item.kind === 'reminder' ? 'bg-yellow-100' : 'bg-blue-100'}`}
            >
              {item.kind === 'task' ? '✓' : item.kind === 'reminder' ? '🔔' : '📎'}
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
            </div>
          </div>
        ))}
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

function DocumentActivity({ document, date }: { document: DocumentResponseDto; date: string }) {
  return (
    <div>
      <span className="text-sm font-medium text-primary">Document uploaded</span>
      <p className="text-sm text-muted mt-0.5">{document.originalName}</p>
      <p className="text-xs text-subtle mt-1">{formatDate(date)} · by {document.uploaderName ?? 'Unknown'}</p>
    </div>
  );
}
