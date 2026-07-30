import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reminderAPI } from '@/lib/api/reminders';
import type { ReminderResponseDto, CreateReminderDto } from '@/lib/types/reminders';
import { reminderKeys } from '@/lib/queries/keys';

const REFRESH_INTERVAL = 30000;

/**
 * Shared across the header notification badge/panel, the dashboard action
 * queue, and the reminders widget — all poll the same pending-reminders list,
 * so this is one cached query instead of each caller fetching independently.
 */
export const useReminders = () => {
  const queryClient = useQueryClient();

  const {
    data: reminders = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: reminderKeys.pending(),
    queryFn: () => reminderAPI.getPending(),
    refetchInterval: REFRESH_INTERVAL,
  });

  const pendingCount = reminders.filter((r) => r.status === 'PENDING').length;

  const createMutation = useMutation({
    mutationFn: (data: CreateReminderDto) => reminderAPI.create(data),
    onSuccess: (created) => {
      queryClient.setQueryData<ReminderResponseDto[]>(reminderKeys.pending(), (old) =>
        old ? [...old, created] : [created],
      );
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => reminderAPI.acknowledge(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<ReminderResponseDto[]>(reminderKeys.pending(), (old) =>
        old?.map((r) => (r.id === updated.id ? updated : r)),
      );
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => reminderAPI.dismiss(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<ReminderResponseDto[]>(reminderKeys.pending(), (old) =>
        old?.map((r) => (r.id === updated.id ? updated : r)),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reminderAPI.delete(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<ReminderResponseDto[]>(reminderKeys.pending(), (old) =>
        old?.filter((r) => r.id !== id),
      );
    },
  });

  return {
    reminders,
    pendingCount,
    loading,
    error: queryError instanceof Error ? queryError.message : null,
    fetchPending: () => queryClient.invalidateQueries({ queryKey: reminderKeys.pending() }),
    createReminder: (data: CreateReminderDto) => createMutation.mutateAsync(data),
    acknowledgeReminder: (id: string) => acknowledgeMutation.mutateAsync(id),
    dismissReminder: (id: string) => dismissMutation.mutateAsync(id),
    deleteReminder: (id: string) => deleteMutation.mutateAsync(id),
  };
};
