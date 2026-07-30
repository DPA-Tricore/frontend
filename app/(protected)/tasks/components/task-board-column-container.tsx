'use client';

import { useTaskBoardColumn } from '@/lib/hooks/use-task-board-column';
import TaskBoardColumn from './task-board-column';

interface TaskBoardColumnContainerProps {
  status: string;
  label: string;
  getUserEmail: (id: string) => string;
}

export default function TaskBoardColumnContainer({
  status,
  label,
  getUserEmail,
}: TaskBoardColumnContainerProps) {
  const { tasks, total, isLoading, hasMore, loadMore } = useTaskBoardColumn(status);

  return (
    <TaskBoardColumn
      status={status}
      label={label}
      tasks={tasks}
      totalCount={total}
      isLoading={isLoading}
      hasMore={hasMore}
      getUserEmail={getUserEmail}
      onLoadMore={loadMore}
    />
  );
}
