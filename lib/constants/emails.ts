import type { EmailStatus, MergeFieldInfo } from '@/lib/types/emails';
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

export const EMAIL_TEMPLATE_MANAGER_ROLES: UserRole[] = ['ORG_ADMIN', 'MANAGER'];
export const EMAIL_TEMPLATE_NAME_MAX_LENGTH = 100;

/** Must match backend/src/modules/emails/constants/merge-fields.constants.ts. */
export const MERGE_FIELDS: MergeFieldInfo[] = [
  { name: 'firstName', description: "Client's first name" },
  { name: 'lastName', description: "Client's last name" },
  { name: 'agentName', description: 'Your name' },
  { name: 'agentEmail', description: 'Your email' },
  { name: 'agencyName', description: 'Agency name' },
  { name: 'policyName', description: 'Their soonest-renewing active policy' },
  { name: 'renewalDate', description: 'When that policy renews' },
];

/** Matches {{ field }} with optional spaces. */
export const MERGE_FIELD_PATTERN = /\{\{\s*([a-zA-Z]+)\s*\}\}/g;

export const EMAIL_TEMPLATE_FORM_DEFAULTS = { name: '', subject: '', body: '', isActive: true };

/** Must match backend EMAIL_MAX_ATTACHMENTS / EMAIL_MAX_ATTACHMENT_BYTES. */
export const EMAIL_MAX_ATTACHMENTS = 5;
export const EMAIL_MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;
