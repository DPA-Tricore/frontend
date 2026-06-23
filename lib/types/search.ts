export type SearchEntityType =
  | 'lead'
  | 'contact'
  | 'task'
  | 'document'
  | 'automation'
  | 'reminder'
  | 'automationStep';

export type SearchTabType = SearchEntityType | 'all';

export interface SearchResultItem {
  id: string;
  entityType: SearchEntityType;
  label: string;
  sublabel?: string;
  url: string;
}

export interface SearchResponse {
  leads: SearchResultItem[];
  contacts: SearchResultItem[];
  tasks: SearchResultItem[];
  documents: SearchResultItem[];
  automations: SearchResultItem[];
  reminders: SearchResultItem[];
  automationSteps: SearchResultItem[];
}

export interface SearchFullResponse {
  data: SearchResultItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SearchFullParams {
  q: string;
  type: SearchEntityType;
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  assignedToId?: string;
  entityTypeFilter?: string;
}

export const ENTITY_LABELS: Record<SearchEntityType, string> = {
  lead: 'Leads',
  contact: 'Contacts',
  task: 'Tasks',
  document: 'Documents',
  automation: 'Automations',
  reminder: 'Reminders',
  automationStep: 'Automation Steps',
};

export const SEARCH_GROUP_ORDER: SearchEntityType[] = [
  'lead',
  'contact',
  'task',
  'document',
  'automation',
  'reminder',
  'automationStep',
];

// Filter options per entity type
export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'IN_NEGOTIATION', 'CONVERTED', 'LOST', 'UNRESPONSIVE'];
export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
export const TASK_TYPES = ['CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'CUSTOM'];
export const REMINDER_STATUSES = ['PENDING', 'TRIGGERED', 'ACKNOWLEDGED', 'DISMISSED', 'CANCELLED'];
export const CONTACT_TYPES = ['EMAIL', 'PHONE', 'FACEBOOK', 'TELEGRAM', 'WEBSITE', 'LINKEDIN', 'TWITTER', 'INSTAGRAM', 'WHATSAPP', 'OTHER'];
export const AUTOMATION_ACTION_TYPES = ['EMAIL', 'SMS', 'CALL_TASK', 'TODO', 'REMINDER', 'TAG'];
export const AUTOMATION_STATUSES = [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }];
