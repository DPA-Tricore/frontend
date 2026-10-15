import type { PaginationMeta } from './common';

export type ReminderStatus = 'PENDING' | 'TRIGGERED' | 'ACKNOWLEDGED' | 'DISMISSED' | 'CANCELLED';

export interface ReminderResponseDto {
  id: string;
  userId: string;
  taskId: string | null;
  leadId: string | null;
  title: string;
  description: string | null;
  dueDate: string;
  reminderTime: string;
  status: ReminderStatus;
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
  leadId?: string;
  taskId?: string;
}

export interface PaginatedReminderResponse {
  data: ReminderResponseDto[];
  meta: PaginationMeta;
}
