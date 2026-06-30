import type { PaginationMeta } from './common';

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
  reminderOffsets?: number[];
  customReminderTimes?: string[];
  demoMode?: boolean;
  status?: string;
  completedAt?: Date | string;
}
