'use client';

import { useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { TaskResponseDto } from '@/lib/types/tasks';
import BoardDropSlot from '@/components/board/board-drop-slot';
import AnimatedCount from '@/components/board/animated-count';
import TaskCard from './task-card';

interface TaskBoardColumnProps {
  status: string;
  label: string;
  tasks: TaskResponseDto[];
  totalCount: number;
  isLoading: boolean;
  hasMore: boolean;
  getUserEmail: (id: string) => string;
  onLoadMore: () => void;
}

export default function TaskBoardColumn({
  status,
  label,
  tasks,
  totalCount,
  isLoading,
  hasMore,
  getUserEmail,
  onLoadMore,
}: TaskBoardColumnProps) {
  const { setNodeRef, isOver, active } = useDroppable({ id: status });
  const sourceStatus = (active?.data.current?.task as TaskResponseDto | undefined)?.status;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isLoading) return;

    const handleScroll = () => {
      if (el.scrollHeight - (el.scrollTop + el.clientHeight) < el.scrollHeight * 0.2 && hasMore) {
        onLoadMore();
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div
      ref={setNodeRef}
      className={[
        'w-64 flex-shrink-0 surface rounded-lg border flex flex-col transition-colors h-full',
        isOver ? 'border-blue-400 ring-2 ring-blue-200' : 'border-[var(--border)]',
      ].join(' ')}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{label}</span>
        <span className="text-xs font-medium text-muted bg-[var(--bg)] border border-[var(--border)] rounded-full px-2 py-0.5">
          <AnimatedCount value={tasks.length} />/<AnimatedCount value={totalCount} />
        </span>
      </div>

      {/* Cards */}
      <div ref={scrollRef} className="flex flex-col gap-2 p-3 flex-1 overflow-y-auto">
        {tasks.length === 0 && !isLoading ? (
          <div
            className={[
              'flex-1 flex items-center justify-center rounded-lg border-2 border-dashed transition-colors',
              isOver ? 'border-blue-300' : 'border-[var(--border)]',
            ].join(' ')}
          >
            <span className="text-xs text-subtle">Drop here</span>
          </div>
        ) : (
          <>
            <BoardDropSlot isOver={isOver} isSourceColumn={sourceStatus === status} />
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} getUserEmail={getUserEmail} />
            ))}
            {isLoading && (
              <div className="flex justify-center py-2">
                <div className="h-4 w-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              </div>
            )}
            {!hasMore && tasks.length > 0 && (
              <p className="text-center text-xs text-subtle py-2">All loaded</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
