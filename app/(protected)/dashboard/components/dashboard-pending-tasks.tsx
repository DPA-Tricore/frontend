import { getPriorityColor, getTaskTypeColor } from '@/lib/theme/colors';
import type { TaskResponseDto } from '@/lib/types/tasks';

interface Props {
  tasks: TaskResponseDto[];
}

function formatDueLabel(dueDate: Date | string): { label: string; overdue: boolean } {
  const d = new Date(dueDate);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, overdue: true };
  if (diffDays === 0) return { label: 'Due today', overdue: false };
  if (diffDays === 1) return { label: 'Due tomorrow', overdue: false };
  return { label: `Due in ${diffDays}d`, overdue: false };
}

export default function DashboardPendingTasks({ tasks }: Props) {
  if (tasks.length === 0) {
    return <div className="text-center py-10 text-muted text-sm">No pending tasks.</div>;
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {tasks.map((task) => {
        const { label, overdue } = formatDueLabel(task.dueDate);
        return (
          <div key={task.id} className="flex items-start justify-between gap-4 py-3 px-1">
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary truncate">{task.title}</p>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                  {task.type.replace(/_/g, ' ')}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>
            <span className={`flex-shrink-0 text-xs font-medium mt-0.5 ${overdue ? 'text-red-600' : 'text-muted'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
