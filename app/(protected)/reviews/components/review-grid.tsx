'use client';

import { colors } from '@/lib/theme/colors';
import { PaginationMeta } from '@/lib/types/common';
import type { ReviewResponseDto } from '@/lib/types/reviews';
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

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted">
            Page {meta.page} of {meta.totalPages}
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={!meta.hasPrevPage}
              className={colors.pagination.button}
            >
              ← Previous
            </button>

            <div className="flex gap-1">
              {(() => {
                const pages: React.ReactNode[] = [];
                const maxPagesToShow = 7;
                let startPage = Math.max(1, meta.page - Math.floor(maxPagesToShow / 2));
                const endPage = Math.min(meta.totalPages, startPage + maxPagesToShow - 1);

                if (endPage - startPage + 1 < maxPagesToShow) {
                  startPage = Math.max(1, endPage - maxPagesToShow + 1);
                }

                if (startPage > 1) {
                  pages.push(
                    <button key={1} onClick={() => onPageChange(1)} className={colors.pagination.inactive}>
                      1
                    </button>,
                  );
                  if (startPage > 2) {
                    pages.push(<span key="dots-start" className="px-2 py-2 text-subtle">...</span>);
                  }
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => onPageChange(i)}
                      className={i === meta.page ? colors.pagination.active : colors.pagination.inactive}
                    >
                      {i}
                    </button>,
                  );
                }

                if (endPage < meta.totalPages) {
                  if (endPage < meta.totalPages - 1) {
                    pages.push(<span key="dots-end" className="px-2 py-2 text-subtle">...</span>);
                  }
                  pages.push(
                    <button
                      key={meta.totalPages}
                      onClick={() => onPageChange(meta.totalPages)}
                      className={colors.pagination.inactive}
                    >
                      {meta.totalPages}
                    </button>,
                  );
                }

                return pages;
              })()}
            </div>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!meta.hasNextPage}
              className={colors.pagination.button}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
