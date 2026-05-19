import { axiosClient } from '@/lib/api/axios-client';

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
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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
  convertedAt?: Date;
  lastContactedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  contacts?: ContactResponseDto[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
}

export const leadsApi = {
  /**
   * Get all leads with optional pagination, search, sorting, and filtering
   */
  async getLeads(params?: ListLeadsParams): Promise<PaginatedLeadResponse | LeadResponseDto[]> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.status) queryParams.append('status', params.status);
      if (params.leadType) queryParams.append('leadType', params.leadType);
    }
    
    const url = queryParams.toString() ? `/leads?${queryParams}` : '/leads';
    const response = await axiosClient.get<PaginatedLeadResponse | LeadResponseDto[]>(url);
    return response.data;
  },

  /**
   * Get a single lead by ID
   */
  async getLead(id: string): Promise<LeadResponseDto> {
    const response = await axiosClient.get<LeadResponseDto>(`/leads/${id}`);
    return response.data;
  },

  /**
   * Create a new lead
   */
  async createLead(data: CreateLeadRequest): Promise<LeadResponseDto> {
    const response = await axiosClient.post<LeadResponseDto>('/leads', data);
    return response.data;
  },

  /**
   * Update an existing lead
   */
  async updateLead(id: string, data: Partial<CreateLeadRequest>): Promise<LeadResponseDto> {
    const response = await axiosClient.patch<LeadResponseDto>(`/leads/${id}`, data);
    return response.data;
  },

  /**
   * Delete a lead (soft delete)
   */
  async deleteLead(id: string): Promise<void> {
    await axiosClient.delete(`/leads/${id}`);
  },
};
