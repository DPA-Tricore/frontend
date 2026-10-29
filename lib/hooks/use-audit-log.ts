import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { activitiesApi } from '@/lib/api/activities';
import { auditLogKeys } from '@/lib/queries/keys';
import type { ListAuditLogParams } from '@/lib/types/activities';

export function useAuditLog(params: ListAuditLogParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => activitiesApi.getAuditLog(params),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    // Every change anywhere in the agency lands here, so check again on every visit.
    staleTime: 0,
  });
}
