import { useCallback, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { taskKeys } from '@/lib/queries/keys';
import { normalizeTasksResponse } from './use-tasks';

const TASKS_PER_COLUMN = 10;

export function useTaskBoardColumn(status: string) {
  const query = useInfiniteQuery({
    queryKey: taskKeys.boardColumn(status),
    queryFn: async ({ pageParam }) =>
      normalizeTasksResponse(
        await tasksApi.getTasks({ status, page: pageParam, limit: TASKS_PER_COLUMN }),
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page * TASKS_PER_COLUMN < lastPage.meta.total ? lastPage.meta.page + 1 : undefined,
  });

  const tasks = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.meta.total ?? 0;

  // TaskBoardColumn's scroll listener re-fires on every scroll event while
  // inside the trigger zone. A fast scroll gesture can dispatch many of those
  // before React re-renders with an updated isLoading prop, so this ref is
  // set synchronously, the instant loadMore() runs, independent of render
  // timing — see the same fix in use-lead-board-column.ts.
  const fetchingRef = useRef(false);
  const { hasNextPage, fetchNextPage } = query;
  const loadMore = useCallback(() => {
    if (fetchingRef.current || !hasNextPage) return;
    fetchingRef.current = true;
    fetchNextPage().finally(() => {
      fetchingRef.current = false;
    });
  }, [hasNextPage, fetchNextPage]);

  return {
    tasks,
    total,
    isLoading: query.isPending || query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    loadMore,
  };
}
