import { axiosClient } from '@/lib/api/axios-client';
import type {
  TaskResponseDto,
  PaginatedTaskResponse,
  ListTasksParams,
  CreateTaskRequest,
  TaskBoardResponse,
} from '@/lib/types/tasks';

export const tasksApi = {
  /** First page of every status column + totals, in one call — backs the board view. */
  async getTasksBoard(): Promise<TaskBoardResponse> {
    const response = await axiosClient.get<TaskBoardResponse>('/tasks/board');
    return response.data;
  },

  async getTasks(params?: ListTasksParams): Promise<PaginatedTaskResponse | TaskResponseDto[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.search) query.append('search', params.search);
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortOrder) query.append('sortOrder', params.sortOrder);
      if (params.status) query.append('status', params.status);
      if (params.priority) query.append('priority', params.priority);
      if (params.type) query.append('type', params.type);
      if (params.assignedToId) query.append('assignedToId', params.assignedToId);
      if (params.leadId) query.append('leadId', params.leadId);
    }
    const url = query.toString() ? `/tasks?${query}` : '/tasks';
    const response = await axiosClient.get<PaginatedTaskResponse | TaskResponseDto[]>(url);
    return response.data;
  },

  async getTask(id: string): Promise<TaskResponseDto> {
    const response = await axiosClient.get<TaskResponseDto>(`/tasks/${id}`);
    return response.data;
  },

  async getTasksByLeadId(leadId: string): Promise<TaskResponseDto[]> {
    const response = await axiosClient.get<TaskResponseDto[]>(`/tasks/lead/${leadId}`);
    return response.data;
  },

  async getTasksByAssignedToId(userId: string): Promise<TaskResponseDto[]> {
    const response = await axiosClient.get<TaskResponseDto[]>(`/tasks/assigned/${userId}`);
    return response.data;
  },

  async createTask(data: CreateTaskRequest): Promise<TaskResponseDto> {
    const response = await axiosClient.post<TaskResponseDto>('/tasks', data);
    return response.data;
  },

  async updateTask(id: string, data: Partial<CreateTaskRequest>): Promise<TaskResponseDto> {
    const response = await axiosClient.patch<TaskResponseDto>(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await axiosClient.delete(`/tasks/${id}`);
  },
};
