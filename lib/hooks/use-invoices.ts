import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '@/lib/api/invoices';
import { invoiceKeys } from '@/lib/queries/keys';
import type {
  CustomerInvoiceFilters,
  CreateCustomerInvoiceRequest,
  UpdateCustomerInvoiceRequest,
  InvoiceAction,
  CustomerInvoiceResponseDto,
} from '@/lib/types/invoices';

export function useInvoices(filters: CustomerInvoiceFilters = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: () => invoicesApi.getInvoices(filters),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoicesApi.getInvoice(id),
    enabled: !!id,
  });
}

// Every change refreshes the lists, and puts the fresh invoice straight into
// its detail cache so the open page updates without a refetch.
function useInvoiceMutation<TArgs>(fn: (args: TArgs) => Promise<CustomerInvoiceResponseDto | void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (invoice) => {
      if (invoice) queryClient.setQueryData(invoiceKeys.detail(invoice.id), invoice);
      queryClient.invalidateQueries({ queryKey: [...invoiceKeys.all, 'list'] });
    },
  });
}

export function useCreateInvoice() {
  return useInvoiceMutation((data: CreateCustomerInvoiceRequest) => invoicesApi.createInvoice(data));
}

export function useUpdateInvoice() {
  return useInvoiceMutation(({ id, data }: { id: string; data: UpdateCustomerInvoiceRequest }) =>
    invoicesApi.updateInvoice(id, data),
  );
}

export function useInvoiceAction() {
  return useInvoiceMutation(({ id, action }: { id: string; action: InvoiceAction }) =>
    invoicesApi.runAction(id, action),
  );
}

export function useDeleteInvoice() {
  return useInvoiceMutation((id: string) => invoicesApi.deleteInvoice(id));
}
