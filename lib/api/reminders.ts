import { axiosClient } from '@/lib/api/axios-client';
import type {
  ReminderResponseDto,
  CreateReminderDto,
  UpdateReminderDto,
  ListRemindersParams,
  PaginatedReminderResponse,
} from '@/lib/types/reminders';

class ReminderAPI {
  async create(data: CreateReminderDto): Promise<ReminderResponseDto> {
    const response = await axiosClient.post<ReminderResponseDto>('/reminders', data);
    return response.data;
  }

  async list(params?: ListRemindersParams): Promise<PaginatedReminderResponse> {
    const response = await axiosClient.get<PaginatedReminderResponse>('/reminders', { params });
    return response.data;
  }

  async getPending(): Promise<ReminderResponseDto[]> {
    const response = await axiosClient.get<ReminderResponseDto[]>('/reminders/pending');
    return response.data;
  }

  async getOne(id: string): Promise<ReminderResponseDto> {
    const response = await axiosClient.get<ReminderResponseDto>(`/reminders/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateReminderDto): Promise<ReminderResponseDto> {
    const response = await axiosClient.patch<ReminderResponseDto>(`/reminders/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/reminders/${id}`);
  }

  async acknowledge(id: string): Promise<ReminderResponseDto> {
    const response = await axiosClient.post<ReminderResponseDto>(`/reminders/${id}/acknowledge`);
    return response.data;
  }

  async dismiss(id: string): Promise<ReminderResponseDto> {
    const response = await axiosClient.post<ReminderResponseDto>(`/reminders/${id}/dismiss`);
    return response.data;
  }
}

export const reminderAPI = new ReminderAPI();
