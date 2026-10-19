'use client';

import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils/date';
import { getPriorityColor, getTaskTypeColor } from '@/lib/theme/colors';
import type { TaskResponseDto } from '@/lib/types/tasks';
import { TASK_STATUS_COLOR } from '@/lib/constants/tasks';

interface TaskListItemProps {
  task: TaskResponseDto;
  getUserName: (id: string) => string;
}

export default function TaskListItem({ task, getUserName }: TaskListItemProps) {
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
        <span className="text-sm text-muted">{getUserName(task.assignedToId)}</span>
      </td>
    </tr>
  );
}
