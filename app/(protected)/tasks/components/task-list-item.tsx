'use client';

import { formatDate } from '@/lib/utils/date';
import { getStatusColor, getPriorityColor, getTaskTypeColor } from '@/lib/theme/colors';
import type { TaskResponseDto } from '@/lib/types/tasks';

interface TaskListItemProps {
  task: TaskResponseDto;
  getUserEmail: (id: string) => string;
}

export default function TaskListItem({ task, getUserEmail }: TaskListItemProps) {
  return (
    <tr className="border-b border-[var(--border)] hover:[background:var(--bg)]">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-primary">{task.title}</div>
        {task.description && (
          <div className="text-xs text-subtle mt-1 line-clamp-2">{task.description}</div>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
          {task.type}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-muted">{formatDate(task.dueDate)}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-muted">{getUserEmail(task.assignedToId)}</span>
      </td>
    </tr>
  );
}
