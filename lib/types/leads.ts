import { PaginationMeta } from './common';

export enum ContactType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  FACEBOOK = 'FACEBOOK',
  TELEGRAM = 'TELEGRAM',
  WEBSITE = 'WEBSITE',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
  INSTAGRAM = 'INSTAGRAM',
  WHATSAPP = 'WHATSAPP',
  OTHER = 'OTHER',
}

export interface ContactResponseDto {
  id: string;
  leadId?: string;
  customerId?: string;
  type: ContactType;
  value: string;
  isPrimary: boolean;
  isVerified: boolean;
  doNotContact: boolean;
  /** Set when an email to this address hard-bounced. */
  bouncedAt?: string | null;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  leadType: string;
  status: string;
  source?: string;
  campaignId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  assignedAgentId?: string;
  budgetRange?: string;
  coverageAmount?: number;
  riskProfile?: string;
  customerId?: string;
  convertedCustomerId?: string;
  convertedAt?: string;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
  contacts?: ContactResponseDto[];
}

export interface PaginatedLeadResponse {
  data: LeadResponseDto[];
  meta: PaginationMeta;
}

export interface LeadBoardColumn {
  status: string;
  data: LeadResponseDto[];
  meta: PaginationMeta;
}

export interface LeadBoardResponse {
  columns: LeadBoardColumn[];
}

export interface ListLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'firstName' | 'lastName' | 'createdAt' | 'status' | 'leadType';
  sortOrder?: 'asc' | 'desc';
  status?: string;
  leadType?: string;
  customerId?: string;
}

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  leadType: string;
  /** Leaving it out starts the lead at NEW. */
  status?: string;
  email?: string;
  phone?: string;
  source?: string;
  coverageAmount?: number;
  budgetRange?: string;
  assignedAgentId?: string;
  reminderTimes?: string[];
  demoMode?: boolean;
}

export interface ExportLeadsParams {
  search?: string;
  status?: string;
  leadType?: string;
}

// 'valid' = passed validation, not yet committed (dry-run only).
// 'created' = actually written to the DB (commit only).
// 'error' = failed validation or the write itself failed.
// 'duplicate' = matched an existing lead or an earlier row in the file — always skipped.
export type ImportRowStatus = 'created' | 'valid' | 'error' | 'duplicate';

export interface ImportRowResultDto {
  row: number;
  status: ImportRowStatus;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  errors: string[];
  warnings: string[];
}

export interface ImportResultDto {
  dryRun: boolean;
  totalRows: number;
  validCount: number;
  errorCount: number;
  duplicateCount: number;
  createdCount: number;
  rows: ImportRowResultDto[];
}

/** Whose contacts — mirrors EmailParty / BillTo. */
export interface ContactOwner {
  type: 'lead' | 'customer';
  id: string;
}

export interface CreateContactRequest {
  type: ContactType;
  value: string;
  isPrimary?: boolean;
  doNotContact?: boolean;
}

export type UpdateContactRequest = Partial<Omit<CreateContactRequest, 'type'>>;
