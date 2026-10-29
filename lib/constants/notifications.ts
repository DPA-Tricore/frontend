import { AlarmClock, ClipboardList, CreditCard, MailX, MessageSquareReply, Receipt, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BrowserAlertStatus, NotificationChannel, NotificationType } from '@/lib/types/notifications';

/** The bell's unread count refreshes this often. A browser alert refreshes it straight away. */
export const NOTIFICATION_POLL_INTERVAL_MS = 30_000;
export const NOTIFICATION_PAGE_SIZE = 20;

export const SERVICE_WORKER_PATH = '/sw.js';

export const NOTIFICATION_SETTINGS_PATH = '/settings/notifications';

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  LEAD_ASSIGNED: UserPlus,
  TASK_ASSIGNED: ClipboardList,
  REMINDER_DUE: AlarmClock,
  EMAIL_REPLY: MessageSquareReply,
  EMAIL_BOUNCED: MailX,
  INVOICE_OVERDUE: Receipt,
  BILLING_PAYMENT_FAILED: CreditCard,
};

export const BROWSER_ALERT_STATUS_TEXT: Record<BrowserAlertStatus, string> = {
  loading: 'Checking this browser…',
  unsupported: "This browser can't show DPA alerts. Chrome, Edge, Firefox and Safari can.",
  'needs-install':
    'On iPhone and iPad, alerts only work once DPA is on your Home Screen. In Safari, tap Share, then Add to Home Screen, then open DPA from there.',
  unavailable: "Browser alerts aren't set up on the server yet.",
  off: 'Get a pop-up on this device when something needs you, even when DPA is in the background.',
  blocked:
    'This browser is blocking DPA alerts. To allow them, click the icon next to the address bar, open the site settings, and set Notifications to Allow. Then reload this page.',
  on: 'On for this browser.',
};

/** Column order on the settings page. */
export const NOTIFICATION_CHANNELS: { channel: NotificationChannel; label: string }[] = [
  { channel: 'IN_APP', label: 'In app' },
  { channel: 'PUSH', label: 'Browser' },
  { channel: 'EMAIL', label: 'Email' },
];
