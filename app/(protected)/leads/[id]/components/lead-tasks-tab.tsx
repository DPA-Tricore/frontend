'use client';

import type { TaskResponseDto } from '@/lib/types/tasks';
import { getStatusColor, getPriorityColor, getTaskTypeColor } from '@/lib/theme/colors';
import { formatDate } from '@/lib/utils/date';
import { useLeadTasks } from '@/lib/hooks/use-lead-detail';

interface LeadTasksTabProps {
  leadId: string;
}

export default function LeadTasksTab({ leadId }: LeadTasksTabProps) {
  const { data: tasks = [], isLoading } = useLeadTasks(leadId);

  if (isLoading) return <p className="text-sm text-subtle">Loading tasks...</p>;

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">✓</p>
        <p className="text-sm text-subtle">No tasks linked to this lead</p>
      </div>
    );
  }

  const open = tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const closed = tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'CANCELLED');

  return (
    <div className="space-y-6">
      {open.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">Open · {open.length}</p>
          <div className="space-y-2">
            {open.map((task) => <TaskRow key={task.id} task={task} />)}
          </div>
        </section>
      )}
      {closed.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">Closed · {closed.length}</p>
          <div className="space-y-2 opacity-60">
            {closed.map((task) => <TaskRow key={task.id} task={task} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function TaskRow({ task }: { task: TaskResponseDto }) {
  return (
    <div className="surface border border-[var(--border)] rounded-lg px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{task.title}</p>
        {task.description && (
          <p className="text-xs text-subtle mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(task.status)}`}>
            {task.status.replace(/_/g, ' ')}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTaskTypeColor(task.type)}`}>
            {task.type.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-subtle">Due</p>
        <p className="text-xs text-primary font-medium">{formatDate(task.dueDate)}</p>
      </div>
    </div>
  );
}
