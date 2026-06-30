'use client';

import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils/date';
import { getPriorityColor, getTaskTypeColor } from '@/lib/theme/colors';
import type { TaskResponseDto } from '@/lib/types/tasks';

const TASK_STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  COMPLETED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  CANCELLED: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

interface TaskListItemProps {
  task: TaskResponseDto;
  getUserEmail: (id: string) => string;
}

export default function TaskListItem({ task, getUserEmail }: TaskListItemProps) {
  const router = useRouter();

  return (
    <tr
      className="border-b border-[var(--border)] hover:[background:var(--bg)] cursor-pointer"
      onClick={() => router.push(`/tasks/${task.id}`)}
    >
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
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${TASK_STATUS_COLOR[task.status] ?? 'bg-gray-500/15 text-gray-600'}`}>
          {task.status.replace(/_/g, ' ')}
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
