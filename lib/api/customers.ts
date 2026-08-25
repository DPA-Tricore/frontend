import { axiosClient } from '@/lib/api/axios-client';
import type {
  CustomerResponseDto,
  PaginatedCustomerResponse,
  ListCustomersParams,
  CreateCustomerRequest,
} from '@/lib/types/customers';

export type {
  CustomerResponseDto,
  PaginatedCustomerResponse,
  ListCustomersParams,
  CreateCustomerRequest,
} from '@/lib/types/customers';
export { CustomerStatus } from '@/lib/types/customers';

export const customersApi = {
  async getCustomers(params?: ListCustomersParams): Promise<PaginatedCustomerResponse> {
    const response = await axiosClient.get<PaginatedCustomerResponse>('/customers', { params });
    return response.data;
  },

  async getCustomer(id: string): Promise<CustomerResponseDto> {
    const response = await axiosClient.get<CustomerResponseDto>(`/customers/${id}`);
    return response.data;
  },

  async createCustomer(data: CreateCustomerRequest): Promise<CustomerResponseDto> {
    const response = await axiosClient.post<CustomerResponseDto>('/customers', data);
    return response.data;
  },

  async updateCustomer(id: string, data: Partial<CreateCustomerRequest>): Promise<CustomerResponseDto> {
    const response = await axiosClient.patch<CustomerResponseDto>(`/customers/${id}`, data);
    return response.data;
  },

  async assignCustomer(id: string, ownerId: string | null): Promise<CustomerResponseDto> {
    const response = await axiosClient.post<CustomerResponseDto>(`/customers/${id}/assign`, { ownerId });
    return response.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await axiosClient.delete(`/customers/${id}`);
  },
};
