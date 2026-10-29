import type { IosNavigator, SavePushSubscriptionRequest } from '@/lib/types/notifications';

/** VAPID public keys come base64url-encoded; pushManager.subscribe wants the raw bytes. */
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/** iPhone and iPad only get push once DPA is on the Home Screen and opened from there. */
export function needsHomeScreenInstall(): boolean {
  if (typeof window === 'undefined') return false;
  // iPadOS reports itself as a Mac; the touch screen gives it away.
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as IosNavigator).standalone === true;
  return isIos && !isStandalone;
}

export function toSubscriptionRequest(subscription: PushSubscription): SavePushSubscriptionRequest {
  const { endpoint, keys } = subscription.toJSON();
  return { endpoint: endpoint!, keys: { p256dh: keys!.p256dh, auth: keys!.auth } };
}
