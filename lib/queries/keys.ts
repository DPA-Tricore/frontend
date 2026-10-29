import type { EmailThreadFilters } from '@/lib/types/emails';
import type { ListLeadsParams } from '@/lib/types/leads';
import type { ListRemindersParams } from '@/lib/types/reminders';
import type { ListCustomersParams } from '@/lib/types/customers';
import type { CustomerInvoiceFilters } from '@/lib/types/invoices';
import type { ListTasksParams } from '@/lib/types/tasks';
import type { ListDocumentsParams } from '@/lib/types/documents';
import type { ListReviewsParams } from '@/lib/types/reviews';
import type { ListAuditLogParams } from '@/lib/types/activities';
import type { ListInvoicesParams } from '@/lib/types/billing';

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
  list: (filters: ListTasksParams) => [...taskKeys.all, 'list', filters] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
};

export const taskReminderKeys = {
  byTask: (taskId: string) => ['taskReminders', taskId] as const,
};

export const taskActivityKeys = {
  byTask: (taskId: string) => ['taskActivity', taskId] as const,
};

export const taskDocumentKeys = {
  byTask: (taskId: string) => ['taskDocuments', taskId] as const,
};

export const taskNoteKeys = {
  byTask: (taskId: string) => ['taskNotes', taskId] as const,
};

export const userKeys = {
  all: ['orgUsers'] as const,
  me: ['orgUsers', 'me'] as const,
};

export const dashboardKeys = {
  summary: () => ['dashboard', 'summary'] as const,
};

export const productKeys = {
  all: ['products'] as const,
  list: (includeInactive: boolean) => [...productKeys.all, 'list', { includeInactive }] as const,
};

export const invoiceKeys = {
  all: ['customerInvoices'] as const,
  list: (filters: CustomerInvoiceFilters) => [...invoiceKeys.all, 'list', filters] as const,
  detail: (id: string) => [...invoiceKeys.all, 'detail', id] as const,
};

export const emailKeys = {
  all: ['emails'] as const,
  threads: (filters: EmailThreadFilters) => [...emailKeys.all, 'threads', filters] as const,
  thread: (id: string) => [...emailKeys.all, 'thread', id] as const,
};

export const emailTemplateKeys = {
  all: ['emailTemplates'] as const,
  list: (includeInactive: boolean) => [...emailTemplateKeys.all, 'list', includeInactive] as const,
};

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
  pushPublicKey: () => [...notificationKeys.all, 'push-public-key'] as const,
};

export const automationKeys = {
  all: ['automations'] as const,
  list: () => [...automationKeys.all, 'list'] as const,
  detail: (id: string) => [...automationKeys.all, 'detail', id] as const,
};

export const documentKeys = {
  all: ['documents'] as const,
  list: (filters: ListDocumentsParams) => [...documentKeys.all, 'list', filters] as const,
};

export const reviewKeys = {
  all: ['reviews'] as const,
  list: (filters: ListReviewsParams) => [...reviewKeys.all, 'list', filters] as const,
  summary: () => [...reviewKeys.all, 'summary'] as const,
};

export const teamKeys = {
  all: ['teams'] as const,
};

export const auditLogKeys = {
  all: ['auditLog'] as const,
  list: (params: ListAuditLogParams) => [...auditLogKeys.all, 'list', params] as const,
};

export const billingKeys = {
  all: ['billing'] as const,
  schedule: () => [...billingKeys.all, 'schedule'] as const,
  invoices: (params: ListInvoicesParams) => [...billingKeys.all, 'invoices', params] as const,
};
