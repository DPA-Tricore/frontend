import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reminderAPI } from '@/lib/api/reminders';
import type { ListRemindersParams, ReminderResponseDto } from '@/lib/types/reminders';
import { reminderKeys } from '@/lib/queries/keys';

const CALENDAR_LIMIT = 200;

export function useRemindersList(filters: ListRemindersParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: reminderKeys.list(filters),
    queryFn: () => reminderAPI.list(filters),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

/**
 * Calendar view shows every reminder (not just the current page/filter) so a
 * month grid isn't missing entries; ListRemindersParams has no date-range
 * filter yet, so this fetches a generous page instead of the true range.
 */
export function useRemindersCalendar(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: reminderKeys.calendar(),
    queryFn: async () =>
      (await reminderAPI.list({ limit: CALENDAR_LIMIT, sortBy: 'dueDate', sortOrder: 'asc' })).data,
    enabled: options?.enabled ?? true,
  });
}

/** Patches the calendar + global pending-badge caches in place, and marks the
 * page's own paginated list stale (refetched only if it's currently mounted —
 * the calendar is deliberately never invalidated this way, since that would
 * flip its loading state and remount it mid-drag). */
function patchAfterStatusChange(
  queryClient: ReturnType<typeof useQueryClient>,
  updated: ReminderResponseDto,
) {
  queryClient.setQueryData<ReminderResponseDto[]>(reminderKeys.calendar(), (old) =>
    old?.map((r) => (r.id === updated.id ? updated : r)),
  );
  queryClient.setQueryData<ReminderResponseDto[]>(reminderKeys.pending(), (old) =>
    old?.map((r) => (r.id === updated.id ? updated : r)),
  );
  queryClient.invalidateQueries({ queryKey: [...reminderKeys.all, 'list'] });
}

export function useAcknowledgeReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reminderAPI.acknowledge(id),
    onSuccess: (updated) => patchAfterStatusChange(queryClient, updated),
  });
}

export function useDismissReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reminderAPI.dismiss(id),
    onSuccess: (updated) => patchAfterStatusChange(queryClient, updated),
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reminderAPI.delete(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<ReminderResponseDto[]>(reminderKeys.calendar(), (old) =>
        old?.filter((r) => r.id !== id),
      );
      queryClient.setQueryData<ReminderResponseDto[]>(reminderKeys.pending(), (old) =>
        old?.filter((r) => r.id !== id),
      );
      queryClient.invalidateQueries({ queryKey: [...reminderKeys.all, 'list'] });
    },
  });
}

export interface RescheduleReminderPayload {
  id: string;
  reminderTime: string;
}

interface RescheduleContext {
  previous: ReminderResponseDto[] | undefined;
}

/** Optimistic: react-big-calendar's drag preview already shows the event at
 * the drop target, so waiting for the round-trip before updating state means
 * it snaps back to the old slot for a moment, then jumps once resolved. */
export function useRescheduleReminder() {
  const queryClient = useQueryClient();
  return useMutation<ReminderResponseDto, Error, RescheduleReminderPayload, RescheduleContext>({
    mutationFn: ({ id, reminderTime }) =>
      reminderAPI.update(id, { reminderTime, dueDate: reminderTime }),
    onMutate: async ({ id, reminderTime }) => {
      await queryClient.cancelQueries({ queryKey: reminderKeys.calendar() });
      const previous = queryClient.getQueryData<ReminderResponseDto[]>(reminderKeys.calendar());
      queryClient.setQueryData<ReminderResponseDto[]>(reminderKeys.calendar(), (old) =>
        old?.map((r) => (r.id === id ? { ...r, reminderTime, dueDate: reminderTime } : r)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context) queryClient.setQueryData(reminderKeys.calendar(), context.previous);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<ReminderResponseDto[]>(reminderKeys.calendar(), (old) =>
        old?.map((r) => (r.id === updated.id ? updated : r)),
      );
    },
  });
}
