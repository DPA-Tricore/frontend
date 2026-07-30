import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { userKeys } from '@/lib/queries/keys';

/**
 * Shared across every page that needs the org's user list (tasks, task detail,
 * lead assignee dropdown, search filters, team management) — one cached query
 * instead of each caller fetching independently.
 */
export function useUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => usersApi.getUsers(),
    enabled: options?.enabled ?? true,
  });
}
