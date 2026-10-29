export type NotificationType =
  | 'LEAD_ASSIGNED'
  | 'TASK_ASSIGNED'
  | 'REMINDER_DUE'
  | 'EMAIL_REPLY'
  | 'EMAIL_BOUNCED'
  | 'INVOICE_OVERDUE'
  | 'BILLING_PAYMENT_FAILED';

export type NotificationChannel = 'IN_APP' | 'PUSH' | 'EMAIL';

/** One entry in the bell. Named so it doesn't clash with the browser's own Notification. */
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPage {
  data: AppNotification[];
  nextCursor: string | null;
}

export interface UnreadNotificationCount {
  count: number;
}

export interface NotificationPreferenceType {
  type: NotificationType;
  label: string;
  description: string;
  /** Only the channels this type has. */
  channels: Partial<Record<NotificationChannel, boolean>>;
}

export interface NotificationPreferenceGroup {
  key: string;
  label: string;
  types: NotificationPreferenceType[];
}

export interface NotificationPreferences {
  groups: NotificationPreferenceGroup[];
}

export interface UpdateNotificationPreferenceRequest {
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface PushPublicKey {
  publicKey: string | null;
}

export interface SavePushSubscriptionRequest {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * Browser alerts on this device:
 * - `unsupported`: the browser can't do push at all
 * - `needs-install`: iPhone/iPad in a normal Safari tab — works only from the Home Screen
 * - `unavailable`: the server has no VAPID key set up
 * - `off`: not turned on here (the browser may or may not have asked yet)
 * - `blocked`: the user clicked Block; only the browser's site settings can undo it
 */
export type BrowserAlertStatus = 'loading' | 'unsupported' | 'needs-install' | 'unavailable' | 'off' | 'blocked' | 'on';

/** Safari's flag for "opened from the Home Screen". */
export interface IosNavigator extends Navigator {
  standalone?: boolean;
}

/** What the service worker posts to open DPA tabs. */
export type ServiceWorkerMessage =
  | { type: 'notification-received' }
  | { type: 'open-notification'; link: string; tag: string };
