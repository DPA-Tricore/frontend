import { useCallback, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api/leads';
import { leadKeys } from '@/lib/queries/keys';
import { normalizeLeadsResponse } from './use-leads';

const LEADS_PER_COLUMN = 10;

export function useLeadBoardColumn(status: string) {
  const query = useInfiniteQuery({
    queryKey: leadKeys.boardColumn(status),
    queryFn: async ({ pageParam }) =>
      normalizeLeadsResponse(
        await leadsApi.getLeads({ status, page: pageParam, limit: LEADS_PER_COLUMN }),
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page * LEADS_PER_COLUMN < lastPage.meta.total ? lastPage.meta.page + 1 : undefined,
  });

  const leads = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.meta.total ?? 0;

  // BoardColumn's scroll listener re-fires on every scroll event while inside
  // the trigger zone. A fast scroll gesture can dispatch many of those before
  // React re-renders with an updated isLoading prop, so a prop/closure-based
  // guard alone isn't enough — this ref is set synchronously, the instant
  // loadMore() runs, independent of render timing.
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
    leads,
    total,
    isLoading: query.isPending || query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    loadMore,
  };
}
