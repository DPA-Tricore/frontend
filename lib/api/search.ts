import { axiosClient } from '@/lib/api/axios-client';
import type { SearchResponse, SearchFullResponse, SearchFullParams } from '@/lib/types/search';

export const searchApi = {
  async search(q: string, limit = 5): Promise<SearchResponse> {
    const params = new URLSearchParams({ q, limit: String(limit) });
    const response = await axiosClient.get<SearchResponse>(`/search?${params}`);
    return response.data;
  },

  async searchFull(params: SearchFullParams): Promise<SearchFullResponse> {
    const qs = new URLSearchParams();
    qs.set('q', params.q);
    qs.set('type', params.type);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
    if (params.dateTo) qs.set('dateTo', params.dateTo);
    if (params.assignedToId) qs.set('assignedToId', params.assignedToId);
    if (params.entityTypeFilter) qs.set('entityTypeFilter', params.entityTypeFilter);
    const response = await axiosClient.get<SearchFullResponse>(`/search/full?${qs}`);
    return response.data;
  },
};
