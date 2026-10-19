'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Check, RotateCcw } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { getTaskTypeColor, getPriorityColor } from '@/lib/theme/colors';
import { TASK_STATUSES, TASK_STATUS_COLOR, CLOSED_TASK_STATUSES, TASK_TYPE_ICONS } from '@/lib/constants/tasks';
import type { TaskResponseDto } from '@/lib/types/tasks';

interface TaskHeroProps {
  task: TaskResponseDto;
  getUserName: (id: string) => string;
  updating: boolean;
  onStatusChange: (status: string) => void;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskHero({
  task,
  getUserName,
  updating,
  onStatusChange,
  onComplete,
  onEdit,
  onDelete,
}: TaskHeroProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDone = CLOSED_TASK_STATUSES.includes(task.status);
  const isOverdue = !isDone && new Date(task.dueDate) < new Date();
  const TypeIcon = TASK_TYPE_ICONS[task.type];

  const assigneeName = getUserName(task.assignedToId);
  const assigneeInitial = assigneeName[0]?.toUpperCase() ?? '?';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // COMPLETED goes through the outcome dialog rather than a bare status PATCH.
  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'COMPLETED') onComplete();
    else onStatusChange(e.target.value);
  };

  return (
    <div>
      {/* Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
          {TypeIcon && <TypeIcon size={12} />}
          {task.type.replace(/_/g, ' ')}
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <select
          value={task.status}
          onChange={handleStatusSelect}
          disabled={updating}
          aria-label="Status"
          className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-60 ${TASK_STATUS_COLOR[task.status] ?? 'bg-gray-500/15 text-gray-600'}`}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {task.tags?.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-subtle border border-[var(--border)]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Title + actions */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <h1 className={`text-3xl font-bold leading-tight ${isDone ? 'text-subtle line-through decoration-2' : 'text-primary'}`}>
          {task.title}
        </h1>

        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {isDone ? (
            <button
              onClick={() => onStatusChange('TODO')}
              disabled={updating}
              className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg border border-[var(--border)] text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Reopen
            </button>
          ) : (
            <button
              onClick={onComplete}
              disabled={updating}
              className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Check size={15} />
              Mark complete
            </button>
          )}

          <div className="relative" ref={menuRef}>
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
                {task.status !== 'CANCELLED' && (
                  <button
                    onClick={() => { setMenuOpen(false); onStatusChange('CANCELLED'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel task
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
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{assigneeInitial}</span>
          </div>
          <span className="text-subtle">{assigneeName}</span>
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
