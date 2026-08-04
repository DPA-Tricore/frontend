import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { dashboardKeys } from '@/lib/queries/keys';

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => dashboardApi.getSummary(),
  });
}
