import { axiosClient } from '@/lib/api/axios-client';

export interface ReminderResponseDto {
  id: string;
  userId: string;
  taskId: string | null;
  leadId: string | null;
  title: string;
  description: string | null;
  dueDate: string;
  reminderTime: string;
  status: 'PENDING' | 'TRIGGERED' | 'ACKNOWLEDGED' | 'DISMISSED' | 'CANCELLED';
  triggeredAt: string | null;
  acknowledgedAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderDto {
  title: string;
  description?: string;
  dueDate: string;
  reminderTime: string;
  taskId?: string;
  leadId?: string;
}

export interface UpdateReminderDto {
  title?: string;
  description?: string;
  dueDate?: string;
  reminderTime?: string;
  taskId?: string;
  leadId?: string;
  status?: string;
}

export interface ListRemindersParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedReminderResponse {
  data: ReminderResponseDto[];
  meta: PaginationMeta;
}

class ReminderAPI {
  /**
   * Create a new reminder
   */
  async create(data: CreateReminderDto): Promise<ReminderResponseDto> {
    try {
      const response = await axiosClient.post<ReminderResponseDto>(
        '/reminders',
        data
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to create reminder';
      throw new Error(message);
    }
  }

  /**
   * Get all user's reminders with optional filters
   */
  async list(params?: ListRemindersParams): Promise<PaginatedReminderResponse> {
    try {
      const response = await axiosClient.get<PaginatedReminderResponse>(
        '/reminders',
        { params }
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch reminders';
      throw new Error(message);
    }
  }

  /**
   * Get pending reminders for dashboard
   */
  async getPending(): Promise<ReminderResponseDto[]> {
    try {
      const response = await axiosClient.get<ReminderResponseDto[]>(
        '/reminders/pending'
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch pending reminders';
      throw new Error(message);
    }
  }

  /**
   * Get a specific reminder by ID
   */
  async getOne(id: string): Promise<ReminderResponseDto> {
    try {
      const response = await axiosClient.get<ReminderResponseDto>(
        `/reminders/${id}`
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch reminder';
      throw new Error(message);
    }
  }

  /**
   * Update a reminder
   */
  async update(
    id: string,
    data: UpdateReminderDto
  ): Promise<ReminderResponseDto> {
    try {
      const response = await axiosClient.patch<ReminderResponseDto>(
        `/reminders/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to update reminder';
      throw new Error(message);
    }
  }

  /**
   * Delete a reminder
   */
  async delete(id: string): Promise<void> {
    try {
      await axiosClient.delete(`/reminders/${id}`);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to delete reminder';
      throw new Error(message);
    }
  }

  /**
   * Mark reminder as acknowledged
   */
  async acknowledge(id: string): Promise<ReminderResponseDto> {
    try {
      const response = await axiosClient.post<ReminderResponseDto>(
        `/reminders/${id}/acknowledge`
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to acknowledge reminder';
      throw new Error(message);
    }
  }

  /**
   * Dismiss a reminder
   */
  async dismiss(id: string): Promise<ReminderResponseDto> {
    try {
      const response = await axiosClient.post<ReminderResponseDto>(
        `/reminders/${id}/dismiss`
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to dismiss reminder';
      throw new Error(message);
    }
  }
}

export const reminderAPI = new ReminderAPI();
