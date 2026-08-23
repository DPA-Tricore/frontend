import { axiosClient } from './axios-client';
import type {
  BillingScheduleResponseDto,
  ListInvoicesParams,
  PaginatedInvoiceResponse,
  SetupPaymentMethodResponse,
} from '@/lib/types/billing';

class BillingAPI {
  async getSchedule(): Promise<BillingScheduleResponseDto> {
    const response = await axiosClient.get<BillingScheduleResponseDto>('/billing/schedule');
    return response.data;
  }

  async getInvoices(params?: ListInvoicesParams): Promise<PaginatedInvoiceResponse> {
    const response = await axiosClient.get<PaginatedInvoiceResponse>('/billing/invoices', { params });
    return response.data;
  }

  async setupPaymentMethod(): Promise<SetupPaymentMethodResponse> {
    const response = await axiosClient.post<SetupPaymentMethodResponse>('/billing/setup-payment-method');
    return response.data;
  }
}

export const billingApi = new BillingAPI();
