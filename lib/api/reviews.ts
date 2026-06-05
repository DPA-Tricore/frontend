import { axiosClient } from '@/lib/api/axios-client';
import type {
  ReviewResponseDto,
  ReviewSummaryDto,
  PaginatedReviewsResponse,
  ListReviewsParams,
} from '@/lib/types/reviews';

export const reviewsApi = {
  async getSummary(): Promise<ReviewSummaryDto> {
    const response = await axiosClient.get<ReviewSummaryDto>('/google-reviews/summary');
    return response.data;
  },

  async getReviews(params?: ListReviewsParams): Promise<PaginatedReviewsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params?.rating) query.append('rating', params.rating.toString());
    const url = query.toString() ? `/google-reviews?${query}` : '/google-reviews';
    const response = await axiosClient.get<PaginatedReviewsResponse>(url);
    return response.data;
  },
};
