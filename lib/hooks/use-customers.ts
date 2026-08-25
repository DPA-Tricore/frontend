import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  customersApi,
  type CreateCustomerRequest,
  type CustomerResponseDto,
} from '@/lib/api/customers';
import { customerKeys, type CustomerListFilters } from '@/lib/queries/keys';

export function useCustomersList(filters: CustomerListFilters) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => customersApi.getCustomers(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customersApi.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

export function useAssignCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ownerId }: { id: string; ownerId: string | null }) =>
      customersApi.assignCustomer(id, ownerId),
    onSuccess: (updated) => {
      queryClient.setQueryData(customerKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      customersApi.updateCustomer(id, { status: status as CustomerResponseDto['status'] }),
    onSuccess: (updated) => {
      queryClient.setQueryData(customerKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: [...customerKeys.all, 'list'] });
    },
  });
}
