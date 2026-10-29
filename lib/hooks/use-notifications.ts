import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationAPI } from '@/lib/api/notifications';
import { notificationKeys } from '@/lib/queries/keys';
import { NOTIFICATION_PAGE_SIZE, NOTIFICATION_POLL_INTERVAL_MS } from '@/lib/constants/notifications';
import type {
  NotificationPage,
  NotificationPreferences,
  UnreadNotificationCount,
  UpdateNotificationPreferenceRequest,
} from '@/lib/types/notifications';

/** The bell's red count. Polls; a browser alert also refreshes it straight away. */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationAPI.unreadCount(),
    refetchInterval: NOTIFICATION_POLL_INTERVAL_MS,
    staleTime: NOTIFICATION_POLL_INTERVAL_MS / 2,
  });
}

/** The bell's list, newest first. Only fetched while the panel is open, and fresh on every open. */
export function useNotificationList(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ pageParam }) => notificationAPI.list(pageParam, NOTIFICATION_PAGE_SIZE),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    staleTime: 0,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationAPI.markRead(id),
    onMutate: (id) => {
      const readAt = new Date().toISOString();
      let wasUnread = false;
      queryClient.setQueryData<InfiniteData<NotificationPage>>(notificationKeys.list(), (old) =>
        old && {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((n) => {
              if (n.id !== id || n.readAt) return n;
              wasUnread = true;
              return { ...n, readAt };
            }),
          })),
        },
      );
      if (wasUnread) {
        queryClient.setQueryData<UnreadNotificationCount>(notificationKeys.unreadCount(), (old) =>
          old && { count: Math.max(0, old.count - 1) },
        );
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => {
      const readAt = new Date().toISOString();
      queryClient.setQueryData<InfiniteData<NotificationPage>>(notificationKeys.list(), (old) =>
        old && {
          ...old,
          pages: old.pages.map((page) => ({ ...page, data: page.data.map((n) => ({ ...n, readAt: n.readAt ?? readAt })) })),
        },
      );
      queryClient.setQueryData<UnreadNotificationCount>(notificationKeys.unreadCount(), { count: 0 });
    },
    onError: () => toast.error("Couldn't mark your notifications as read. Try again."),
  });
}

/** Settings → Notifications: every type the user gets, grouped, with a switch per channel. */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationAPI.getPreferences(),
  });
}

/** Flips the switch straight away and puts it back if saving fails. */
export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();

  const setSwitch = ({ type, channel, enabled }: UpdateNotificationPreferenceRequest) =>
    queryClient.setQueryData<NotificationPreferences>(notificationKeys.preferences(), (old) =>
      old && {
        groups: old.groups.map((group) => ({
          ...group,
          types: group.types.map((t) => (t.type === type ? { ...t, channels: { ...t.channels, [channel]: enabled } } : t)),
        })),
      },
    );

  return useMutation({
    mutationFn: (data: UpdateNotificationPreferenceRequest) => notificationAPI.updatePreference(data),
    onMutate: (data) => setSwitch(data),
    onError: (_error, data) => {
      setSwitch({ ...data, enabled: !data.enabled });
      toast.error("Couldn't save that setting. Try again.");
    },
  });
}
