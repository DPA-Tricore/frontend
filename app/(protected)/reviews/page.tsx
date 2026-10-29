'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useReviews, useReviewSummary } from '@/lib/hooks/use-reviews';
import PageHeader from '@/components/page-header';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import PaginationSummary from '@/components/pagination-summary';
import ReviewSummary from './components/review-summary';
import ReviewFilters from './components/review-filters';
import ReviewGrid from './components/review-grid';

const LIMIT = 9;

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'publishedAt' | 'rating'>('publishedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);

  const { data, isLoading: loading, isError } = useReviews({
    page,
    limit: LIMIT,
    sortBy,
    sortOrder,
    ...(ratingFilter && { rating: ratingFilter }),
  });
  const reviews = data?.data ?? [];
  const meta = data?.meta ?? null;
  const error = isError ? 'Failed to load reviews.' : null;
  const { data: summary } = useReviewSummary();

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-') as ['publishedAt' | 'rating', 'asc' | 'desc'];
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleRatingFilter = (value: number | undefined) => {
    setRatingFilter(value);
    setPage(1);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Google Reviews"
        error={error}
      />

      {summary && <ReviewSummary summary={summary} />}

      <ReviewFilters
        sortValue={`${sortBy}-${sortOrder}`}
        ratingFilter={ratingFilter}
        onSortChange={handleSortChange}
        onRatingFilter={handleRatingFilter}
      />

      {meta && <PaginationSummary meta={meta} page={page} limit={LIMIT} label="reviews" />}

      {loading ? (
        <LoadingSpinner message="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <EmptyState
          message="No reviews found."
          icon={<Star size={32} className="mx-auto text-subtle" />}
        />
      ) : (
        <ReviewGrid
          reviews={reviews}
          meta={meta}
          page={page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
