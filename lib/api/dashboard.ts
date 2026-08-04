import { axiosClient } from '@/lib/api/axios-client';
import type { DashboardSummaryDto } from '@/lib/types/dashboard';

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummaryDto> {
    const response = await axiosClient.get<DashboardSummaryDto>('/dashboard/summary');
    return response.data;
  },
};
