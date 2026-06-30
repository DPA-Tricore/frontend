import Link from 'next/link';
import { formatDateTime } from '@/lib/utils/date';
import type { TaskResponseDto } from '@/lib/types/tasks';

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
      <span className="text-xs text-subtle shrink-0">{label}</span>
      <span className="text-xs text-primary font-medium text-right">{value}</span>
    </div>
  );
}

interface TaskPropertiesPanelProps {
  task: TaskResponseDto;
  getUserEmail: (id: string) => string;
}

export default function TaskPropertiesPanel({ task, getUserEmail }: TaskPropertiesPanelProps) {
  return (
    <aside className="surface border border-[var(--border)] rounded-xl p-5 space-y-0">
      {/* Properties */}
      <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-1">Properties</p>
      <Row label="Type" value={task.type.replace(/_/g, ' ')} />
      <Row label="Priority" value={task.priority} />
      <Row label="Status" value={task.status.replace(/_/g, ' ')} />
      <Row label="Assignee" value={getUserEmail(task.assignedToId)} />
      <Row label="Created by" value={getUserEmail(task.createdById)} />

      <div className="border-b border-[var(--border)] my-4" />

      {/* Timeline */}
      <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-1">Timeline</p>
      <Row label="Due" value={formatDateTime(task.dueDate)} />
      {task.startDate && <Row label="Start" value={formatDateTime(task.startDate)} />}
      {task.completedAt && <Row label="Completed" value={formatDateTime(task.completedAt)} />}
      <Row label="Created" value={formatDateTime(task.createdAt)} />
      <Row label="Updated" value={formatDateTime(task.updatedAt)} />

      {task.reminderAt && (
        <>
          <div className="border-b border-[var(--border)] my-4" />
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-1">Reminder</p>
          <Row label="Remind at" value={formatDateTime(task.reminderAt)} />
          <Row label="Sent" value={task.reminderSent ? 'Yes' : 'Pending'} />
        </>
      )}

      {task.leadId && (
        <>
          <div className="border-b border-[var(--border)] my-4" />
          <Link
            href={`/leads/${task.leadId}`}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View Related Lead →
          </Link>
        </>
      )}

      <div className="border-b border-[var(--border)] my-4" />
      <p className="text-xs text-subtle font-mono break-all">{task.id}</p>
    </aside>
  );
}
