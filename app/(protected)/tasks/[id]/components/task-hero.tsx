'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { tasksApi } from '@/lib/api/tasks';
import { formatDate } from '@/lib/utils/date';
import { getTaskTypeColor, getPriorityColor } from '@/lib/theme/colors';
import type { TaskResponseDto } from '@/lib/types/tasks';

const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const TASK_STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  COMPLETED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  CANCELLED: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

interface TaskHeroProps {
  task: TaskResponseDto;
  getUserEmail: (id: string) => string;
  completing: boolean;
  onStatusChange: (status: string) => void;
  onMarkComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskHero({
  task,
  getUserEmail,
  completing,
  onStatusChange,
  onMarkComplete,
  onEdit,
  onDelete,
}: TaskHeroProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDone = task.status === 'COMPLETED' || task.status === 'CANCELLED';
  const isOverdue =
    !isDone && new Date(task.dueDate) < new Date();

  const assigneeEmail = getUserEmail(task.assignedToId);
  const assigneeInitial = assigneeEmail[0]?.toUpperCase() ?? '?';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setUpdatingStatus(true);
    try {
      await tasksApi.updateTask(task.id, { status: newStatus });
      onStatusChange(newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div>
      {/* Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
          {task.type.replace(/_/g, ' ')}
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={updatingStatus}
          className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-60 ${TASK_STATUS_COLOR[task.status] ?? 'bg-gray-500/15 text-gray-600'}`}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <h1 className="text-3xl font-bold text-primary leading-tight">{task.title}</h1>

        <div className="relative shrink-0 mt-0.5" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-subtle hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="More actions"
          >
            <MoreHorizontal size={20} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 surface border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-20">
              <button
                onClick={() => { setMenuOpen(false); onEdit(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Edit
              </button>
              {!isDone && (
                <button
                  onClick={() => { setMenuOpen(false); onMarkComplete(); }}
                  disabled={completing}
                  className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
                >
                  {completing ? 'Completing…' : 'Mark complete'}
                </button>
              )}
              <div className="border-t border-[var(--border)]" />
              <button
                onClick={() => { setMenuOpen(false); onDelete(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{assigneeInitial}</span>
          </div>
          <span className="text-subtle">{assigneeEmail}</span>
        </div>

        <span className="text-[var(--border)]">·</span>

        <span className={isOverdue ? 'text-red-600 font-medium' : 'text-subtle'}>
          Due {formatDate(task.dueDate)}{isOverdue ? ' · Overdue' : ''}
        </span>

        {task.startDate && (
          <>
            <span className="text-[var(--border)]">·</span>
            <span className="text-subtle">Started {formatDate(task.startDate)}</span>
          </>
        )}

        {task.completedAt && (
          <>
            <span className="text-[var(--border)]">·</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              Completed {formatDate(task.completedAt)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
