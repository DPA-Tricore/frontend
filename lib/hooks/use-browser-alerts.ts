import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationAPI } from '@/lib/api/notifications';
import { notificationKeys } from '@/lib/queries/keys';
import { pushService } from '@/lib/services/push';
import { apiErrorMessage } from '@/lib/utils/api-error';
import type { BrowserAlertStatus } from '@/lib/types/notifications';

/** The "Browser alerts on this device" card: where this browser stands, and turning alerts on and off. */
export function useBrowserAlerts() {
  // Fetched up front: Safari only shows the permission prompt if the click handler awaits nothing before it.
  const { data: key } = useQuery({
    queryKey: notificationKeys.pushPublicKey(),
    queryFn: () => notificationAPI.getPushPublicKey(),
    staleTime: Infinity,
  });
  const [browserStatus, setBrowserStatus] = useState<BrowserAlertStatus>('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    pushService.getStatus().then((next) => {
      if (active) setBrowserStatus(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const status: BrowserAlertStatus =
    browserStatus === 'off' && key && !key.publicKey ? 'unavailable' : browserStatus === 'off' && !key ? 'loading' : browserStatus;

  const enable = async () => {
    if (!key?.publicKey) return;
    setBusy(true);
    try {
      const permission = await pushService.enable(key.publicKey);
      if (permission === 'granted') {
        setBrowserStatus('on');
        toast.success('Browser alerts are on');
      } else {
        setBrowserStatus(permission === 'denied' ? 'blocked' : 'off');
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't turn on browser alerts. Try again."));
      setBrowserStatus(await pushService.getStatus());
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      await pushService.disable();
      setBrowserStatus('off');
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't turn off browser alerts. Try again."));
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setBusy(true);
    try {
      await notificationAPI.sendTestPush();
      toast.success('Test alert sent. It should pop up in a few seconds.');
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't send a test alert. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return { status, busy, enable, disable, sendTest };
}
