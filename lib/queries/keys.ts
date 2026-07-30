import type { ListLeadsParams } from '@/lib/types/leads';

export type LeadListFilters = Omit<ListLeadsParams, 'status'> & { status?: string };

export const leadKeys = {
  all: ['leads'] as const,
  list: (filters: LeadListFilters) => [...leadKeys.all, 'list', filters] as const,
  boardSummary: () => [...leadKeys.all, 'board-summary'] as const,
  boardColumn: (status: string) => [...leadKeys.all, 'board', status] as const,
  detail: (id: string) => [...leadKeys.all, 'detail', id] as const,
};

export const leadTaskKeys = {
  byLead: (leadId: string) => ['leadTasks', leadId] as const,
};

export const leadDocumentKeys = {
  byLead: (leadId: string) => ['leadDocuments', leadId] as const,
};

export const leadReminderKeys = {
  byLead: (leadId: string) => ['leadReminders', leadId] as const,
};

export const leadActivityKeys = {
  byLead: (leadId: string) => ['leadActivity', leadId] as const,
};

export const reminderKeys = {
  pending: () => ['reminders', 'pending'] as const,
};

export const taskKeys = {
  all: ['tasks'] as const,
  boardSummary: () => [...taskKeys.all, 'board-summary'] as const,
  boardColumn: (status: string) => [...taskKeys.all, 'board', status] as const,
};

export const userKeys = {
  all: ['orgUsers'] as const,
};
