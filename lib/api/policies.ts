import { axiosClient } from '@/lib/api/axios-client';
import type { PolicyResponseDto, CreatePolicyRequest } from '@/lib/types/customers';

export type { PolicyResponseDto, CreatePolicyRequest } from '@/lib/types/customers';
export { PolicyStatus, BillingInterval } from '@/lib/types/customers';

export const policiesApi = {
  async getPolicies(customerId: string): Promise<PolicyResponseDto[]> {
    const response = await axiosClient.get<PolicyResponseDto[]>(`/customers/${customerId}/policies`);
    return response.data;
  },

  async createPolicy(customerId: string, data: CreatePolicyRequest): Promise<PolicyResponseDto> {
    const response = await axiosClient.post<PolicyResponseDto>(`/customers/${customerId}/policies`, data);
    return response.data;
  },

  async updatePolicy(customerId: string, policyId: string, data: Partial<CreatePolicyRequest>): Promise<PolicyResponseDto> {
    const response = await axiosClient.patch<PolicyResponseDto>(`/customers/${customerId}/policies/${policyId}`, data);
    return response.data;
  },

  async deletePolicy(customerId: string, policyId: string): Promise<void> {
    await axiosClient.delete(`/customers/${customerId}/policies/${policyId}`);
  },
};
