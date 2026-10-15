import type { PaginationMeta } from './common';
import type { ContactType } from './leads';
import type { ActivityResponseDto } from './activities';
import type { NoteResponseDto } from './notes';
import type { DocumentResponseDto } from './documents';

export interface TaskLeadContact {
  id: string;
  type: ContactType;
  value: string;
  isPrimary: boolean;
  doNotContact: boolean;
}

/** Slim lead attached to GET /tasks/:id only. */
export interface TaskLeadSummary {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  leadType: string;
  contacts: TaskLeadContact[];
}

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
  lead?: TaskLeadSummary;
}

export interface PaginatedTaskResponse {
  data: TaskResponseDto[];
  meta: PaginationMeta;
}

export interface TaskBoardColumn {
  status: string;
  data: TaskResponseDto[];
  meta: PaginationMeta;
}

export interface TaskBoardResponse {
  columns: TaskBoardColumn[];
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
  /** null clears it, e.g. when a task is reopened. */
  completedAt?: Date | string | null;
}

export type TaskFeedKind = 'created' | 'activity' | 'note' | 'document';

export interface TaskFeedItem {
  id: string;
  kind: TaskFeedKind;
  date: string;
  activity?: ActivityResponseDto;
  note?: NoteResponseDto;
  document?: DocumentResponseDto;
}
