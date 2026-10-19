'use client';

import { useRouter } from 'next/navigation';
import { useDraggable } from '@dnd-kit/core';
import { formatDate } from '@/lib/utils/date';
import { getTaskTypeColor, getPriorityColor } from '@/lib/theme/colors';
import type { TaskResponseDto } from '@/lib/types/tasks';

interface TaskCardProps {
  task: TaskResponseDto;
  getUserName: (id: string) => string;
  isOverlay?: boolean;
}

export default function TaskCard({ task, getUserName, isOverlay = false }: TaskCardProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const isOverdue =
    task.status !== 'COMPLETED' &&
    task.status !== 'CANCELLED' &&
    new Date(task.dueDate) < new Date();

  const assigneeName = getUserName(task.assignedToId);
  const assigneeInitial = assigneeName[0]?.toUpperCase() ?? '?';

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => !isOverlay && router.push(`/tasks/${task.id}`)}
      className={[
        'surface rounded-lg border border-[var(--border)] p-3 cursor-pointer active:cursor-grabbing transition-all select-none',
        isDragging ? 'opacity-40' : 'hover:border-blue-400',
        isOverlay ? 'rotate-1 shadow-xl scale-105' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Type + Priority badges */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTaskTypeColor(task.type)}`}>
          {task.type.replace(/_/g, ' ')}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-primary leading-tight mb-2">{task.title}</p>

      {/* Due date */}
      <p className={`text-xs mb-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-subtle'}`}>
        Due {formatDate(task.dueDate)}{isOverdue ? ' · Overdue' : ''}
      </p>

      {/* Assignee */}
      <div className="flex items-center gap-2 mt-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold" style={{ fontSize: '9px' }}>{assigneeInitial}</span>
          </div>
          <span className="text-xs text-subtle truncate">{assigneeName}</span>
        </div>
      </div>
    </div>
  );
}
