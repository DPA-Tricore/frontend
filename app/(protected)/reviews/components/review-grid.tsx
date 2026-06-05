'use client';

import { PaginationMeta } from '@/lib/types/common';
import type { ReviewResponseDto } from '@/lib/types/reviews';
import Pagination from '@/components/pagination';
import ReviewCard from './review-card';

interface ReviewGridProps {
  reviews: ReviewResponseDto[];
  meta: PaginationMeta | null;
  page: number;
  onPageChange: (page: number) => void;
}

export default function ReviewGrid({ reviews, meta, page, onPageChange }: ReviewGridProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {meta && <Pagination meta={meta} page={page} onPageChange={onPageChange} />}
    </div>
  );
}
