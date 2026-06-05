'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import type { ReviewResponseDto } from '@/lib/types/reviews';
import { formatDate } from '@/lib/utils/date';

export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300 fill-gray-200'
          }
        />
      ))}
    </div>
  );
}

export function ReviewerAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
      {initials}
    </div>
  );
}

interface ReviewCardProps {
  review: ReviewResponseDto;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = (review.text?.length ?? 0) > 160;

  return (
    <div className="surface rounded-lg border border-[var(--border)] p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <ReviewerAvatar name={review.reviewerName} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary truncate">{review.reviewerName}</p>
          <p className="text-xs text-subtle mt-0.5">{formatDate(review.publishedAt)}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>

      <div className="flex-1">
        {review.text ? (
          <>
            <p className={`text-sm text-muted leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
              {review.text}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-600 hover:opacity-70 mt-1.5 font-medium transition-opacity"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-subtle italic">No review text</p>
        )}
      </div>

      <div className="pt-3 border-t border-[var(--border)]">
        {review.replied ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Responded {formatDate(review.repliedAt)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Awaiting response
          </span>
        )}
      </div>
    </div>
  );
}
