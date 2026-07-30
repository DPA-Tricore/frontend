import { axiosClient } from '@/lib/api/axios-client';
import type {
  LeadResponseDto,
  PaginatedLeadResponse,
  ListLeadsParams,
  CreateLeadRequest,
  ExportLeadsParams,
  ImportResultDto,
} from '@/lib/types/leads';

export type {
  ContactResponseDto,
  LeadResponseDto,
  PaginatedLeadResponse,
  ListLeadsParams,
  CreateLeadRequest,
  ExportLeadsParams,
  ImportRowStatus,
  ImportRowResultDto,
  ImportResultDto,
} from '@/lib/types/leads';
export { ContactType } from '@/lib/types/leads';

// Bulk import can process up to 1,000 rows server-side; give it more room than the default 5s.
const IMPORT_TIMEOUT_MS = 60000;

function downloadBlob(data: BlobPart, fileName: string) {
  const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

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

  /** Downloads a CSV of every lead matching the given filters (server applies the same role-based scoping as getLeads). */
  async exportCsv(params?: ExportLeadsParams): Promise<void> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.status) q.append('status', params.status);
    if (params?.leadType) q.append('leadType', params.leadType);
    const qs = q.toString();
    const res = await axiosClient.get(`/leads/export${qs ? `?${qs}` : ''}`, { responseType: 'blob' });
    downloadBlob(res.data, `leads-${new Date().toISOString().slice(0, 10)}.csv`);
  },

  /** Downloads a starter CSV with the header row + one example row for importLeads. */
  async downloadImportTemplate(): Promise<void> {
    const res = await axiosClient.get('/leads/import/template', { responseType: 'blob' });
    downloadBlob(res.data, 'leads-import-template.csv');
  },

  /**
   * Validates (dryRun=true) or commits (dryRun=false) a CSV import. Same call
   * shape both times — the import page re-sends the identical file on confirm,
   * there's no server-side import session to reference.
   */
  async importLeads(file: File, dryRun: boolean): Promise<ImportResultDto> {
    const form = new FormData();
    form.append('file', file);
    const res = await axiosClient.post<ImportResultDto>(
      `/leads/import?dryRun=${dryRun}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: IMPORT_TIMEOUT_MS },
    );
    return res.data;
  },
};
