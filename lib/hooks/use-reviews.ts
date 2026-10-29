import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api/reviews';
import { reviewKeys } from '@/lib/queries/keys';
import type { ListReviewsParams } from '@/lib/types/reviews';

export function useReviews(filters: ListReviewsParams) {
  return useQuery({
    queryKey: reviewKeys.list(filters),
    queryFn: () => reviewsApi.getReviews(filters),
    placeholderData: keepPreviousData,
  });
}

export function useReviewSummary() {
  return useQuery({
    queryKey: reviewKeys.summary(),
    queryFn: () => reviewsApi.getSummary(),
  });
}
