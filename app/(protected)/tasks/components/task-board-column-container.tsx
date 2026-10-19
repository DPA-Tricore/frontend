'use client';

import { useTaskBoardColumn } from '@/lib/hooks/use-task-board-column';
import TaskBoardColumn from './task-board-column';

interface TaskBoardColumnContainerProps {
  status: string;
  label: string;
  getUserName: (id: string) => string;
}

export default function TaskBoardColumnContainer({
  status,
  label,
  getUserName,
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
      getUserName={getUserName}
      onLoadMore={loadMore}
    />
  );
}
