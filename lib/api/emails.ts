import { axiosClient } from '@/lib/api/axios-client';
import type {
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
