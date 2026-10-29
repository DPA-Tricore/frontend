import { useQuery } from '@tanstack/react-query';
import { teamsApi } from '@/lib/api/teams';
import { teamKeys } from '@/lib/queries/keys';

export function useTeams(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: teamKeys.all,
    queryFn: () => teamsApi.getTeams(),
    enabled: options?.enabled ?? true,
  });
}
