'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { TaskResponseDto } from '@/lib/types/tasks';
import type { UserResponseDto } from '@/lib/api/users';
import { useUpdateTaskStatus, useTasksBoardSummary } from '@/lib/hooks/use-tasks';
import LoadingSpinner from '@/components/loading-spinner';
import TaskBoardColumnContainer from './task-board-column-container';
import TaskCard from './task-card';

const BOARD_COLUMNS: { status: string; label: string }[] = [
  { status: 'TODO', label: 'Todo' },
  { status: 'PENDING', label: 'Pending' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'COMPLETED', label: 'Completed' },
  { status: 'CANCELLED', label: 'Cancelled' },
];

interface TaskBoardViewProps {
  users: UserResponseDto[];
}

export default function TaskBoardView({ users }: TaskBoardViewProps) {
  const [activeTask, setActiveTask] = useState<TaskResponseDto | null>(null);
  const updateTaskStatus = useUpdateTaskStatus();
  // Seeds each column's cache with its first page — mounting columns before this
  // resolves would make each one fire its own page-1 fetch, defeating the point.
  const { isLoading: boardLoading } = useTasksBoardSummary();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const getUserEmail = (userId: string) =>
    users.find((u) => u.id === userId)?.email ?? 'Unknown';

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTask((active.data.current?.task as TaskResponseDto) ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;
    const task = active.data.current?.task as TaskResponseDto | undefined;
    const newStatus = over.id as string;
    if (!task || newStatus === task.status) return;

    updateTaskStatus.mutate({ task, newStatus });
  };

  if (boardLoading) {
    return <LoadingSpinner message="Loading board..." />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="pb-4 h-[calc(100vh-200px)]">
        <div className="grid grid-cols-5 gap-4 h-full">
          {BOARD_COLUMNS.map(({ status, label }) => (
            <TaskBoardColumnContainer
              key={status}
              status={status}
              label={label}
              getUserEmail={getUserEmail}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeTask ? (
          <TaskCard task={activeTask} getUserEmail={getUserEmail} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
