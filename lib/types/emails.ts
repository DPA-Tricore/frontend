export type EmailDirection = 'OUTBOUND' | 'INBOUND';
export type EmailStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'BOUNCED' | 'COMPLAINED' | 'FAILED' | 'RECEIVED';

/** Who an email thread belongs to — mirrors BillTo on invoices. */
export interface EmailParty {
  type: 'lead' | 'customer';
  id: string;
  name: string;
}

export interface EmailMessageResponseDto {
  id: string;
  threadId: string;
  direction: EmailDirection;
  source: 'MANUAL' | 'AUTOMATION' | 'INVOICE';
  status: EmailStatus;
  fromAddress: string;
  toAddresses: string[];
  ccAddresses: string[];
  subject: string;
  bodyText: string;
  bodyHtml: string;
  error: string | null;
  /** Rough — Apple Mail opens every email automatically. Only counted when open tracking is on. */
  openCount: number;
  firstOpenedAt: string | null;
  sentAt: string | null;
  createdAt: string;
  sentBy: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
}

export interface EmailThreadSummaryDto {
  id: string;
  leadId: string | null;
  customerId: string | null;
  subject: string;
  lastMessageAt: string;
  messageCount: number;
  lastMessage: Pick<EmailMessageResponseDto, 'id' | 'direction' | 'status' | 'bodyText' | 'createdAt'> | null;
}

export interface EmailThreadResponseDto {
  id: string;
  leadId: string | null;
  customerId: string | null;
  subject: string;
  lastMessageAt: string;
  messages: EmailMessageResponseDto[];
}

export interface EmailThreadFilters {
  leadId?: string;
  customerId?: string;
}

export interface SendEmailRequest {
  leadId?: string;
  customerId?: string;
  threadId?: string;
  to: string[];
  subject: string;
  bodyText: string;
  templateId?: string;
}

export interface EmailTemplateResponseDto {
  id: string;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  subject: string;
  body: string;
  isActive?: boolean;
}

export type UpdateEmailTemplateRequest = Partial<CreateEmailTemplateRequest>;

export interface RenderedEmailTemplateDto {
  templateId: string;
  subject: string;
  bodyText: string;
  missingFields: string[];
}

export interface MergeFieldInfo {
  name: string;
  description: string;
}
