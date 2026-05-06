import { axiosClient } from '@/lib/api/axios-client';

export interface TaskResponseDto {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  leadId?: string;
  assignedToId: string;
  createdById: string;
  dueDate: Date;
  startDate?: Date;
  completedAt?: Date;
  outcome?: string;
  resultType?: string;
  reminderAt?: Date;
  reminderSent: boolean;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedTaskResponse {
  data: TaskResponseDto[];
  meta: PaginationMeta;
}

export interface ListTasksParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'dueDate' | 'status' | 'priority' | 'type';
  sortOrder?: 'asc' | 'desc';
  status?: string;
  priority?: string;
  type?: string;
  assignedToId?: string;
  leadId?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  type: string;
  leadId?: string;
  assignedToId: string;
  dueDate: Date | string;
  startDate?: Date | string;
  priority?: string;
  outcome?: string;
  resultType?: string;
  reminderAt?: Date | string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export const tasksApi = {
  /**
   * Get all tasks with optional pagination, search, sorting, and filtering
   */
  async getTasks(params?: ListTasksParams): Promise<PaginatedTaskResponse | TaskResponseDto[]> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.status) queryParams.append('status', params.status);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.type) queryParams.append('type', params.type);
      if (params.assignedToId) queryParams.append('assignedToId', params.assignedToId);
      if (params.leadId) queryParams.append('leadId', params.leadId);
    }
    
    const url = queryParams.toString() ? `/tasks?${queryParams}` : '/tasks';
    const response = await axiosClient.get<PaginatedTaskResponse | TaskResponseDto[]>(url);
    return response.data;
  },

  /**
   * Get a single task by ID
   */
  async getTask(id: string): Promise<TaskResponseDto> {
    const response = await axiosClient.get<TaskResponseDto>(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Get all tasks for a specific lead
   */
  async getTasksByLeadId(leadId: string): Promise<TaskResponseDto[]> {
    const response = await axiosClient.get<TaskResponseDto[]>(`/tasks/lead/${leadId}`);
    return response.data;
  },

  /**
   * Get all tasks assigned to a specific user
   */
  async getTasksByAssignedToId(userId: string): Promise<TaskResponseDto[]> {
    const response = await axiosClient.get<TaskResponseDto[]>(`/tasks/assigned/${userId}`);
    return response.data;
  },

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskRequest): Promise<TaskResponseDto> {
    const response = await axiosClient.post<TaskResponseDto>('/tasks', data);
    return response.data;
  },

  /**
   * Update an existing task
   */
  async updateTask(id: string, data: Partial<CreateTaskRequest>): Promise<TaskResponseDto> {
    const response = await axiosClient.patch<TaskResponseDto>(`/tasks/${id}`, data);
    return response.data;
  },

  /**
   * Delete a task (soft delete)
   */
  async deleteTask(id: string): Promise<void> {
    await axiosClient.delete(`/tasks/${id}`);
  },
};
