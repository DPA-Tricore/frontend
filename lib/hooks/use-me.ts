import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { userKeys } from '@/lib/queries/keys';
import type { UpdateProfileRequest } from '@/lib/types/users';

/** The signed-in user's own profile (name, team). */
export function useMe() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: () => usersApi.getMe(),
  });
}

/** Saves the user's own name, then refreshes every user list that shows it. */
export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => usersApi.updateMe(data),
    onSuccess: (me) => {
      queryClient.setQueryData(userKeys.me, me);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
