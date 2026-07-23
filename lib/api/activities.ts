import { axiosClient } from '@/lib/api/axios-client';
import type { ActivityResponseDto, ListActivitiesParams } from '@/lib/types/activities';

class ActivitiesAPI {
  async list(params: ListActivitiesParams): Promise<ActivityResponseDto[]> {
    const response = await axiosClient.get<ActivityResponseDto[]>('/activities', { params });
    return response.data;
  }
}

export const activitiesApi = new ActivitiesAPI();
