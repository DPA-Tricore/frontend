import type { PaginationMeta } from './common';

export interface ReviewResponseDto {
  id: string;
  reviewerName: string;
  rating: number;
  text: string | null;
  publishedAt: string;
  replied: boolean;
  replyText: string | null;
  repliedAt: string | null;
}

export interface ReviewSummaryDto {
  rating: number;
  totalReviews: number;
  newThisMonth: number;
  ratingBreakdown: Record<number, number>;
}

export interface PaginatedReviewsResponse {
  data: ReviewResponseDto[];
  meta: PaginationMeta;
}

export interface ListReviewsParams {
  page?: number;
  limit?: number;
  sortBy?: 'publishedAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  rating?: number;
}
