import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { billingApi } from '@/lib/api/billing';
import { billingKeys } from '@/lib/queries/keys';
import type { ListInvoicesParams } from '@/lib/types/billing';

// Payments settle in the background (Stripe webhook, daily charge), so billing
// is checked again on every visit rather than served from cache.

/** The agency's billing schedule, or null when it has none yet (the API answers 404). */
export function useBillingSchedule(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: billingKeys.schedule(),
    queryFn: async () => {
      try {
        return await billingApi.getSchedule();
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: 0,
  });
}

export function useBillingInvoices(params: ListInvoicesParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: billingKeys.invoices(params),
    queryFn: () => billingApi.getInvoices(params),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
