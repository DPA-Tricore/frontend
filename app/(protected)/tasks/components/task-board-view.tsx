'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { tasksApi } from '@/lib/api/tasks';
import type { TaskResponseDto } from '@/lib/types/tasks';
import type { UserResponseDto } from '@/lib/api/users';
import TaskBoardColumn from './task-board-column';
import TaskCard from './task-card';

const BOARD_COLUMNS: { status: string; label: string }[] = [
  { status: 'TODO', label: 'Todo' },
  { status: 'PENDING', label: 'Pending' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'COMPLETED', label: 'Completed' },
  { status: 'CANCELLED', label: 'Cancelled' },
];

const TASKS_PER_COLUMN = 10;

interface ColumnState {
  tasks: TaskResponseDto[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  total: number;
}

type ColumnStates = Record<string, ColumnState>;

interface TaskBoardViewProps {
  users: UserResponseDto[];
  onStatusChange: (taskId: string, newStatus: string, oldStatus: string) => void;
}

export default function TaskBoardView({ users, onStatusChange }: TaskBoardViewProps) {
  const [columnStates, setColumnStates] = useState<ColumnStates>(
    BOARD_COLUMNS.reduce(
      (acc, { status }) => ({
        ...acc,
        [status]: { tasks: [], page: 1, hasMore: true, isLoading: true, total: 0 },
      }),
      {} as ColumnStates,
    ),
  );
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const getUserEmail = (userId: string) =>
    users.find((u) => u.id === userId)?.email ?? 'Unknown';

  const loadTasks = useCallback(async (status: string, page: number) => {
    try {
      setColumnStates((prev) => ({
        ...prev,
        [status]: { ...prev[status], isLoading: true },
      }));

      const response = await tasksApi.getTasks({ status, page, limit: TASKS_PER_COLUMN });
      const paginated = response as any;
      const newTasks: TaskResponseDto[] = paginated.data ?? [];
      const total: number = paginated.meta?.total ?? 0;
      const hasMore = (paginated.meta?.page ?? 1) * TASKS_PER_COLUMN < total;

      setColumnStates((prev) => ({
        ...prev,
        [status]: {
          tasks: page === 1 ? newTasks : [...prev[status].tasks, ...newTasks],
          page,
          hasMore,
          isLoading: false,
          total,
        },
      }));
    } catch {
      setColumnStates((prev) => ({
        ...prev,
        [status]: { ...prev[status], isLoading: false },
      }));
    }
  }, []);

  useEffect(() => {
    BOARD_COLUMNS.forEach(({ status }) => loadTasks(status, 1));
  }, [loadTasks]);

  const handleLoadMore = useCallback(
    (status: string) => {
      const state = columnStates[status];
      if (!state.isLoading && state.hasMore) {
        loadTasks(status, state.page + 1);
      }
    },
    [columnStates, loadTasks],
  );

  const allTasks = Object.values(columnStates).flatMap((s) => s.tasks);
  const activeTask = allTasks.find((t) => t.id === activeTaskId) ?? null;

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTaskId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTaskId(null);
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const oldStatus = active.data.current?.status as string;
    if (newStatus === oldStatus) return;

    const taskToMove = columnStates[oldStatus]?.tasks.find((t) => t.id === taskId);
    if (!taskToMove) return;

    // Optimistic update
    setColumnStates((prev) => ({
      ...prev,
      [oldStatus]: {
        ...prev[oldStatus],
        tasks: prev[oldStatus].tasks.filter((t) => t.id !== taskId),
        total: prev[oldStatus].total - 1,
      },
      [newStatus]: {
        ...prev[newStatus],
        tasks: [{ ...taskToMove, status: newStatus }, ...prev[newStatus].tasks],
        total: prev[newStatus].total + 1,
      },
    }));

    onStatusChange(taskId, newStatus, oldStatus);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="pb-4 h-[calc(100vh-200px)]">
        <div className="grid grid-cols-5 gap-4 h-full">
          {BOARD_COLUMNS.map(({ status, label }) => {
            const state = columnStates[status];
            return (
              <TaskBoardColumn
                key={status}
                status={status}
                label={label}
                tasks={state.tasks}
                totalCount={state.total}
                isLoading={state.isLoading}
                hasMore={state.hasMore}
                getUserEmail={getUserEmail}
                onLoadMore={() => handleLoadMore(status)}
              />
            );
          })}
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
