'use client';

import { ArrowLeft, Reply } from 'lucide-react';
import { colors } from '@/lib/theme/colors';
import { formatDateTime } from '@/lib/utils/date';
import { userDisplayName } from '@/lib/utils/user-name';
import { useEmailThread } from '@/lib/hooks/use-emails';
import type { EmailMessageResponseDto } from '@/lib/types/emails';
import EmailStatusBadge from './email-status-badge';

interface EmailThreadViewProps {
  threadId: string;
  canSend: boolean;
  onBack: () => void;
  onReply: (subject: string, to: string[]) => void;
}

/** The person who sent it if we know them, else the From address's display name. */
function senderLabel(message: EmailMessageResponseDto): string {
  if (message.sentBy) return userDisplayName(message.sentBy);
  return message.fromAddress.match(/^"?([^"<]+)"?\s*</)?.[1]?.trim() ?? message.fromAddress;
}

export default function EmailThreadView({ threadId, canSend, onBack, onReply }: EmailThreadViewProps) {
  const { data: thread, isLoading } = useEmailThread(threadId);

  if (isLoading || !thread) return <p className="text-sm text-subtle">Loading email...</p>;

  const last = thread.messages[thread.messages.length - 1];
  const replyTo = last?.direction === 'INBOUND' ? [last.fromAddress.match(/<([^>]+)>/)?.[1] ?? last.fromAddress] : last?.toAddresses ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <button onClick={onBack} className={`${colors.button.text} flex items-center gap-1.5`}>
          <ArrowLeft size={14} /> All emails
        </button>
        {canSend && last && (
          <button onClick={() => onReply(thread.subject, replyTo)} className={`${colors.button.text} flex items-center gap-1.5`}>
            <Reply size={14} /> Reply
          </button>
        )}
      </div>

      <h3 className="text-lg font-semibold text-primary text-balance">{thread.subject}</h3>

      <div className="space-y-3">
        {thread.messages.map((m) => (
          <article key={m.id} className="surface rounded-lg border border-[var(--border)] p-4">
            <header className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary truncate">{senderLabel(m)}</p>
                <p className="text-xs text-subtle truncate">To {m.toAddresses.join(', ')}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <EmailStatusBadge status={m.status} />
                <span className="text-xs text-subtle">{formatDateTime(m.sentAt ?? m.createdAt)}</span>
              </div>
            </header>
            <p className="text-sm text-primary whitespace-pre-wrap break-words">{m.bodyText}</p>
            {m.status === 'FAILED' && m.error && <p className="mt-3 text-xs text-red-600">{m.error}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
