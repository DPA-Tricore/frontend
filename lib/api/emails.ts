import { axiosClient } from '@/lib/api/axios-client';
import type {
  CreateEmailTemplateRequest,
  EmailTemplateResponseDto,
  RenderedEmailTemplateDto,
  UpdateEmailTemplateRequest,
  EmailMessageResponseDto,
  EmailThreadFilters,
  EmailThreadResponseDto,
  EmailThreadSummaryDto,
  SendEmailRequest,
} from '@/lib/types/emails';

export const emailsApi = {
  async getThreads(filters: EmailThreadFilters): Promise<EmailThreadSummaryDto[]> {
    const response = await axiosClient.get<EmailThreadSummaryDto[]>('/email-threads', { params: filters });
    return response.data;
  },

  async getThread(id: string): Promise<EmailThreadResponseDto> {
    const response = await axiosClient.get<EmailThreadResponseDto>(`/email-threads/${id}`);
    return response.data;
  },

  async send(data: SendEmailRequest): Promise<EmailMessageResponseDto> {
    const response = await axiosClient.post<EmailMessageResponseDto>('/emails', data);
    return response.data;
  },
};

export const emailTemplatesApi = {
  async getTemplates(includeInactive = false): Promise<EmailTemplateResponseDto[]> {
    const response = await axiosClient.get<EmailTemplateResponseDto[]>('/email-templates', { params: { includeInactive } });
    return response.data;
  },

  async createTemplate(data: CreateEmailTemplateRequest): Promise<EmailTemplateResponseDto> {
    const response = await axiosClient.post<EmailTemplateResponseDto>('/email-templates', data);
    return response.data;
  },

  async updateTemplate(id: string, data: UpdateEmailTemplateRequest): Promise<EmailTemplateResponseDto> {
    const response = await axiosClient.patch<EmailTemplateResponseDto>(`/email-templates/${id}`, data);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await axiosClient.delete(`/email-templates/${id}`);
  },

  /** The template filled in for one lead or customer. */
  async renderTemplate(id: string, party: { leadId?: string; customerId?: string }): Promise<RenderedEmailTemplateDto> {
    const response = await axiosClient.post<RenderedEmailTemplateDto>(`/email-templates/${id}/render`, party);
    return response.data;
  },
};
