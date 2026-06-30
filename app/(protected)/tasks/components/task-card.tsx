'use client';

import Link from 'next/link';
import { useDraggable } from '@dnd-kit/core';
import { formatDate } from '@/lib/utils/date';
import { getTaskTypeColor, getPriorityColor } from '@/lib/theme/colors';
import type { TaskResponseDto } from '@/lib/types/tasks';

interface TaskCardProps {
  task: TaskResponseDto;
  getUserEmail: (id: string) => string;
  isOverlay?: boolean;
}

export default function TaskCard({ task, getUserEmail, isOverlay = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  const isOverdue =
    task.status !== 'COMPLETED' &&
    task.status !== 'CANCELLED' &&
    new Date(task.dueDate) < new Date();

  const assigneeEmail = getUserEmail(task.assignedToId);
  const assigneeInitial = assigneeEmail[0]?.toUpperCase() ?? '?';

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={[
        'surface rounded-lg border border-[var(--border)] p-3 cursor-grab active:cursor-grabbing transition-all select-none',
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

      {/* Assignee + View link */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold" style={{ fontSize: '9px' }}>{assigneeInitial}</span>
          </div>
          <span className="text-xs text-subtle truncate">{assigneeEmail}</span>
        </div>
        <Link
          href={`/tasks/${task.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-subtle hover:text-primary transition-colors shrink-0"
        >
          View →
        </Link>
      </div>
    </div>
  );
}
