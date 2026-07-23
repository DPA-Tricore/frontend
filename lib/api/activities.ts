import { axiosClient } from '@/lib/api/axios-client';
import type {
  ActivityResponseDto,
  ListActivitiesParams,
  PaginatedAuditLogResponse,
  ListAuditLogParams,
} from '@/lib/types/activities';

class ActivitiesAPI {
  async list(params: ListActivitiesParams): Promise<ActivityResponseDto[]> {
    const response = await axiosClient.get<ActivityResponseDto[]>('/activities', { params });
    return response.data;
  }

  async getAuditLog(params?: ListAuditLogParams): Promise<PaginatedAuditLogResponse> {
    const response = await axiosClient.get<PaginatedAuditLogResponse>('/activities/audit-log', { params });
    return response.data;
  }
}

export const activitiesApi = new ActivitiesAPI();
