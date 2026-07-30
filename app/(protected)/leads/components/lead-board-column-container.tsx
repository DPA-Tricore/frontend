'use client';

import { useLeadBoardColumn } from '@/lib/hooks/use-lead-board-column';
import BoardColumn from './lead-board-column';

interface BoardColumnContainerProps {
  status: string;
  label: string;
}

export default function BoardColumnContainer({ status, label }: BoardColumnContainerProps) {
  const { leads, total, isLoading, hasMore, loadMore } = useLeadBoardColumn(status);

  return (
    <BoardColumn
      status={status}
      label={label}
      leads={leads}
      isLoading={isLoading}
      hasMore={hasMore}
      totalCount={total}
      onLoadMore={loadMore}
    />
  );
}
