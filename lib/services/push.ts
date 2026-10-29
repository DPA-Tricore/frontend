import { notificationAPI } from '@/lib/api/notifications';
import { SERVICE_WORKER_PATH } from '@/lib/constants/notifications';
import { isPushSupported, needsHomeScreenInstall, toSubscriptionRequest, urlBase64ToUint8Array } from '@/lib/utils/push';
import type { BrowserAlertStatus } from '@/lib/types/notifications';

/**
 * The browser side of browser alerts: the service worker (public/sw.js) and
 * this browser's push subscription. See docs/architecture/Notifications.md.
 */
class PushService {
  register(): Promise<ServiceWorkerRegistration> {
    return navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: '/', updateViaCache: 'none' });
  }

  /** Where this browser stands. Doesn't know whether the server has a key; the caller checks that. */
  async getStatus(): Promise<BrowserAlertStatus> {
    if (needsHomeScreenInstall()) return 'needs-install';
    if (!isPushSupported()) return 'unsupported';
    if (Notification.permission === 'denied') return 'blocked';
    if (Notification.permission !== 'granted') return 'off';
    return (await this.getSubscription()) ? 'on' : 'off';
  }

  async getSubscription(): Promise<PushSubscription | null> {
    const registration = await navigator.serviceWorker.getRegistration('/');
    return registration ? registration.pushManager.getSubscription() : null;
  }

  /**
   * Asks for permission, subscribes, and saves it for the signed-in user. Must
   * run straight from a click: Safari only shows the prompt if nothing was
   * awaited before it, so the public key has to be fetched beforehand.
   */
  async enable(publicKey: string): Promise<NotificationPermission> {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return permission;

    await this.register();
    const registration = await navigator.serviceWorker.ready;
    // An old subscription may be tied to a different key; subscribe() refuses to replace it.
    await (await registration.pushManager.getSubscription())?.unsubscribe();
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    await notificationAPI.savePushSubscription(toSubscriptionRequest(subscription));
    return permission;
  }

  async disable(): Promise<void> {
    const subscription = await this.getSubscription();
    if (!subscription) return;
    await notificationAPI.removePushSubscription(subscription.endpoint);
    await subscription.unsubscribe();
  }

  /**
   * On every app load: picks up a new sw.js, and re-saves this browser's
   * subscription so the server's copy is current and belongs to whoever is
   * signed in. Never asks for permission or turns alerts on by itself.
   */
  async sync(): Promise<void> {
    if (!isPushSupported() || Notification.permission !== 'granted') return;
    await this.register();
    const subscription = await this.getSubscription();
    if (subscription) await notificationAPI.savePushSubscription(toSubscriptionRequest(subscription));
  }

  /** On logout, so the next person on this browser doesn't get this user's alerts. Never throws. */
  async forgetThisBrowser(): Promise<void> {
    if (!isPushSupported()) return;
    try {
      await this.disable();
    } catch {
      // Logging out must work even if this fails.
    }
  }
}

export const pushService = new PushService();
