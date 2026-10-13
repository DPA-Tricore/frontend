import type { ListLeadsParams } from '@/lib/types/leads';
import type { ListRemindersParams } from '@/lib/types/reminders';
import type { ListCustomersParams } from '@/lib/types/customers';

export type LeadListFilters = Omit<ListLeadsParams, 'status'> & { status?: string };
export type CustomerListFilters = Omit<ListCustomersParams, 'status'> & { status?: string };

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

export const leadNoteKeys = {
  byLead: (leadId: string) => ['leadNotes', leadId] as const,
};

export const customerKeys = {
  all: ['customers'] as const,
  list: (filters: CustomerListFilters) => [...customerKeys.all, 'list', filters] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
};

export const customerPolicyKeys = {
  byCustomer: (customerId: string) => ['customerPolicies', customerId] as const,
};

export const customerActivityKeys = {
  byCustomer: (customerId: string) => ['customerActivity', customerId] as const,
};

export const reminderKeys = {
  all: ['reminders'] as const,
  pending: () => [...reminderKeys.all, 'pending'] as const,
  list: (filters: ListRemindersParams) => [...reminderKeys.all, 'list', filters] as const,
  calendar: () => [...reminderKeys.all, 'calendar'] as const,
};

export const taskKeys = {
  all: ['tasks'] as const,
  boardSummary: () => [...taskKeys.all, 'board-summary'] as const,
  boardColumn: (status: string) => [...taskKeys.all, 'board', status] as const,
};

export const userKeys = {
  all: ['orgUsers'] as const,
};

export const dashboardKeys = {
  summary: () => ['dashboard', 'summary'] as const,
};

export const productKeys = {
  all: ['products'] as const,
  list: (includeInactive: boolean) => [...productKeys.all, 'list', { includeInactive }] as const,
};
