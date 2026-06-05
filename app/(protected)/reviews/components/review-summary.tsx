'use client';

import { Star } from 'lucide-react';
import { StarRating } from './review-card';
import type { ReviewSummaryDto } from '@/lib/types/reviews';

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-subtle w-3 text-right">{star}</span>
      <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-subtle w-4 text-right">{count}</span>
    </div>
  );
}

interface ReviewSummaryProps {
  summary: ReviewSummaryDto;
}

export default function ReviewSummary({ summary }: ReviewSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="surface rounded-lg border border-[var(--border)] p-5 flex flex-col gap-2">
        <p className="text-xs font-medium text-subtle uppercase tracking-wide">Overall Rating</p>
        <p className="text-4xl font-bold text-primary">{summary.rating}</p>
        <StarRating rating={Math.round(summary.rating)} size={16} />
      </div>

      <div className="surface rounded-lg border border-[var(--border)] p-5 flex flex-col gap-2">
        <p className="text-xs font-medium text-subtle uppercase tracking-wide">Total Reviews</p>
        <p className="text-4xl font-bold text-primary">{summary.totalReviews}</p>
        <p className="text-xs text-muted">across all time</p>
      </div>

      <div className="surface rounded-lg border border-[var(--border)] p-5 flex flex-col gap-2">
        <p className="text-xs font-medium text-subtle uppercase tracking-wide">New This Month</p>
        <p className="text-4xl font-bold text-primary">
          {summary.newThisMonth > 0 ? `+${summary.newThisMonth}` : summary.newThisMonth}
        </p>
        <p className="text-xs text-muted">reviews received</p>
      </div>

      <div className="surface rounded-lg border border-[var(--border)] p-5 flex flex-col gap-2.5">
        <p className="text-xs font-medium text-subtle uppercase tracking-wide">Breakdown</p>
        {[5, 4, 3, 2, 1].map((star) => (
          <RatingBar
            key={star}
            star={star}
            count={summary.ratingBreakdown[star] ?? 0}
            total={summary.totalReviews}
          />
        ))}
      </div>
    </div>
  );
}
