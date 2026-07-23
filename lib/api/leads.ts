import { axiosClient } from '@/lib/api/axios-client';
import type {
  LeadResponseDto,
  PaginatedLeadResponse,
  ListLeadsParams,
  CreateLeadRequest,
} from '@/lib/types/leads';

export type {
  ContactResponseDto,
  LeadResponseDto,
  PaginatedLeadResponse,
  ListLeadsParams,
  CreateLeadRequest,
} from '@/lib/types/leads';
export { ContactType } from '@/lib/types/leads';

export const leadsApi = {
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

  async getLead(id: string): Promise<LeadResponseDto> {
    const response = await axiosClient.get<LeadResponseDto>(`/leads/${id}`);
    return response.data;
  },

  async createLead(data: CreateLeadRequest): Promise<LeadResponseDto> {
    const response = await axiosClient.post<LeadResponseDto>('/leads', data);
    return response.data;
  },

  async updateLead(id: string, data: Partial<CreateLeadRequest>): Promise<LeadResponseDto> {
    const response = await axiosClient.patch<LeadResponseDto>(`/leads/${id}`, data);
    return response.data;
  },

  async assignLead(id: string, agentId: string | null): Promise<LeadResponseDto> {
    const response = await axiosClient.post<LeadResponseDto>(`/leads/${id}/assign`, { agentId });
    return response.data;
  },

  async deleteLead(id: string): Promise<void> {
    await axiosClient.delete(`/leads/${id}`);
  },
};
