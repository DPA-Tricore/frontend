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
  leadId: string;
  type: ContactType;
  value: string;
  isPrimary: boolean;
  isVerified: boolean;
  doNotContact: boolean;
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

export interface ListLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'firstName' | 'lastName' | 'createdAt' | 'status' | 'leadType';
  sortOrder?: 'asc' | 'desc';
  status?: string;
  leadType?: string;
}

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  leadType: string;
  status: string;
  email?: string;
  source?: string;
  reminderTimes?: string[];
  demoMode?: boolean;
}
