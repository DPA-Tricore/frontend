import { axiosClient } from '@/lib/api/axios-client';
import type {
  CustomerInvoiceResponseDto,
  CreateCustomerInvoiceRequest,
  UpdateCustomerInvoiceRequest,
  CustomerInvoiceFilters,
  InvoiceAction,
} from '@/lib/types/invoices';

export const invoicesApi = {
  async getInvoices(filters: CustomerInvoiceFilters = {}): Promise<CustomerInvoiceResponseDto[]> {
    const response = await axiosClient.get<CustomerInvoiceResponseDto[]>('/customer-invoices', { params: filters });
    return response.data;
  },

  async getInvoice(id: string): Promise<CustomerInvoiceResponseDto> {
    const response = await axiosClient.get<CustomerInvoiceResponseDto>(`/customer-invoices/${id}`);
    return response.data;
  },

  async createInvoice(data: CreateCustomerInvoiceRequest): Promise<CustomerInvoiceResponseDto> {
    const response = await axiosClient.post<CustomerInvoiceResponseDto>('/customer-invoices', data);
    return response.data;
  },

  async updateInvoice(id: string, data: UpdateCustomerInvoiceRequest): Promise<CustomerInvoiceResponseDto> {
    const response = await axiosClient.patch<CustomerInvoiceResponseDto>(`/customer-invoices/${id}`, data);
    return response.data;
  },

  async runAction(id: string, action: InvoiceAction): Promise<CustomerInvoiceResponseDto> {
    const response = await axiosClient.post<CustomerInvoiceResponseDto>(`/customer-invoices/${id}/${action}`);
    return response.data;
  },

  async deleteInvoice(id: string): Promise<void> {
    await axiosClient.delete(`/customer-invoices/${id}`);
  },
};
