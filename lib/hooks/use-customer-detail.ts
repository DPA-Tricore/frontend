import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/customers';
import { policiesApi, type CreatePolicyRequest, type PolicyResponseDto } from '@/lib/api/policies';
import { activitiesApi } from '@/lib/api/activities';
import type { ActivityResponseDto } from '@/lib/types/activities';
import { leadsApi } from '@/lib/api/leads';
import { customerKeys, customerPolicyKeys, customerActivityKeys } from '@/lib/queries/keys';

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.getCustomer(id),
    enabled: !!id,
  });
}

export function useCustomerActivity(customerId: string) {
  return useQuery<ActivityResponseDto[]>({
    queryKey: customerActivityKeys.byCustomer(customerId),
    queryFn: () => activitiesApi.list({ entityType: 'CUSTOMER', entityId: customerId }),
    enabled: !!customerId,
  });
}

/** Leads tied to this customer — repeat-business (customerId) or the original conversion (convertedCustomerId). */
export function useCustomerLeads(customerId: string) {
  return useQuery({
    queryKey: ['customerLeads', customerId] as const,
    queryFn: async () => {
      const res = await leadsApi.getLeads({ customerId, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
      return Array.isArray(res) ? res : res.data;
    },
    enabled: !!customerId,
  });
}

export function useCustomerPolicies(customerId: string) {
  return useQuery({
    queryKey: customerPolicyKeys.byCustomer(customerId),
    queryFn: () => policiesApi.getPolicies(customerId),
    enabled: !!customerId,
  });
}

export function useCreatePolicy(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePolicyRequest) => policiesApi.createPolicy(customerId, data),
    onSuccess: (policy) => {
      queryClient.setQueryData<PolicyResponseDto[]>(customerPolicyKeys.byCustomer(customerId), (old) =>
        old ? [policy, ...old] : [policy],
      );
      queryClient.invalidateQueries({ queryKey: customerActivityKeys.byCustomer(customerId) });
    },
  });
}

export function useUpdatePolicy(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, data }: { policyId: string; data: Partial<CreatePolicyRequest> }) =>
      policiesApi.updatePolicy(customerId, policyId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<PolicyResponseDto[]>(customerPolicyKeys.byCustomer(customerId), (old) =>
        old?.map((p) => (p.id === updated.id ? updated : p)),
      );
      queryClient.invalidateQueries({ queryKey: customerActivityKeys.byCustomer(customerId) });
    },
  });
}

export function useDeletePolicy(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (policyId: string) => policiesApi.deletePolicy(customerId, policyId),
    onSuccess: (_data, policyId) => {
      queryClient.setQueryData<PolicyResponseDto[]>(customerPolicyKeys.byCustomer(customerId), (old) =>
        old?.filter((p) => p.id !== policyId),
      );
    },
  });
}
