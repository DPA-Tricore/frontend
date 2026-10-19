import { EMAIL_STATUS_LABELS, EMAIL_STATUS_STYLES } from '@/lib/constants/emails';
import type { EmailStatus } from '@/lib/types/emails';

export default function EmailStatusBadge({ status }: { status: EmailStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${EMAIL_STATUS_STYLES[status]}`}>
      {EMAIL_STATUS_LABELS[status]}
    </span>
  );
}
