import type { EmailStatus } from '@/lib/types/emails';
import type { UserRole } from '@/lib/types/users';

/** How often an open thread re-checks while an email is still sending. */
export const EMAIL_SENDING_POLL_MS = 2000;

export const EMAIL_SENDER_ROLES: UserRole[] = ['ORG_ADMIN', 'MANAGER', 'AGENT'];

export const EMAIL_SUBJECT_MAX_LENGTH = 200;
export const EMAIL_BODY_MAX_LENGTH = 20000;

export const EMAIL_STATUS_LABELS: Record<EmailStatus, string> = {
  QUEUED: 'Sending…',
  SENT: 'Sent',
  DELIVERED: 'Delivered',
  BOUNCED: 'Bounced',
  COMPLAINED: 'Marked as spam',
  FAILED: 'Failed',
  RECEIVED: 'Received',
};

export const EMAIL_STATUS_STYLES: Record<EmailStatus, string> = {
  QUEUED: 'bg-gray-500/15 text-muted',
  SENT: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  DELIVERED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  BOUNCED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  COMPLAINED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  FAILED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  RECEIVED: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
};
