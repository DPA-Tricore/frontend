import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '@/lib/api/notifications';
import { notificationKeys } from '@/lib/queries/keys';
import { pushService } from '@/lib/services/push';
import { isPushSupported } from '@/lib/utils/push';
import type { ServiceWorkerMessage } from '@/lib/types/notifications';

/**
 * Runs once per app load, from the header's bell. Re-saves this browser's
 * push subscription for whoever is signed in, and listens to the service
 * worker: a new alert refreshes the bell at once, and clicking an alert
 * opens its page in this tab and marks it read.
 */
export function useBrowserAlertsSync() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!isPushSupported()) return;
    pushService.sync().catch(() => {
      // Best effort: the settings page shows the real state.
    });

    const refreshBell = () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    };

    const onMessage = (event: MessageEvent<ServiceWorkerMessage>) => {
      const message = event.data;
      if (message?.type === 'notification-received') refreshBell();
      if (message?.type === 'open-notification') {
        router.push(message.link);
        // The tag is the notification's id when it's in the bell. Anything else (a test alert) just 404s.
        notificationAPI.markRead(message.tag).catch(() => {}).finally(refreshBell);
      }
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [queryClient, router]);
}
