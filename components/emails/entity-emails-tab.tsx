'use client';

import { useState } from 'react';
import { Mail, Plus } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { colors } from '@/lib/theme/colors';
import { EMAIL_SENDER_ROLES } from '@/lib/constants/emails';
import { formatDate } from '@/lib/utils/date';
import { useEmailThreads } from '@/lib/hooks/use-emails';
import type { ContactResponseDto } from '@/lib/types/leads';
import type { EmailParty } from '@/lib/types/emails';
import type { UserRole } from '@/lib/types/users';
import EmptyState from '@/components/empty-state';
import EmailStatusBadge from './email-status-badge';
import EmailThreadView from './email-thread-view';
import EmailComposerModal, { type ComposerReply } from './email-composer-modal';

interface EntityEmailsTabProps {
  party: EmailParty;
  contacts: ContactResponseDto[];
}

// The Emails tab on a lead or customer page.
export default function EntityEmailsTab({ party, contacts }: EntityEmailsTabProps) {
  const { user } = useAuth();
  const canSend = !!user?.role && EMAIL_SENDER_ROLES.includes(user.role as UserRole);
  const filter = party.type === 'customer' ? { customerId: party.id } : { leadId: party.id };
  const { data: threads = [], isLoading } = useEmailThreads(filter);

  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [reply, setReply] = useState<ComposerReply | null>(null);

  const startNew = () => {
    setReply(null);
    setIsComposerOpen(true);
  };

  const composer = (
    <EmailComposerModal
      isOpen={isComposerOpen}
      onClose={() => setIsComposerOpen(false)}
      party={party}
      contacts={contacts}
      reply={reply}
      onSent={setOpenThreadId}
    />
  );

  if (openThreadId) {
    return (
      <>
        <EmailThreadView
          threadId={openThreadId}
          canSend={canSend}
          onBack={() => setOpenThreadId(null)}
          onReply={(subject, to) => {
            setReply({ threadId: openThreadId, subject: /^re:/i.test(subject) ? subject : `Re: ${subject}`, to });
            setIsComposerOpen(true);
          }}
        />
        {composer}
      </>
    );
  }

  if (isLoading) return <p className="text-sm text-subtle">Loading emails...</p>;

  return (
    <div>
      {canSend && (
        <div className="flex justify-end mb-4">
          <button onClick={startNew} className={`${colors.button.text} flex items-center gap-1.5`}>
            <Plus size={14} /> New Email
          </button>
        </div>
      )}

      {threads.length === 0 ? (
        <EmptyState message="No emails yet" icon={<Mail size={32} className="mx-auto text-subtle" />} />
      ) : (
        <ul className="surface rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
          {threads.map((t) => (
            <li key={t.id}>
              <button onClick={() => setOpenThreadId(t.id)} className="w-full text-left p-4 interactive">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-primary truncate">
                    {t.subject}
                    {t.messageCount > 1 && <span className="ml-2 text-xs text-subtle">{t.messageCount}</span>}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {t.lastMessage && <EmailStatusBadge status={t.lastMessage.status} />}
                    <span className="text-xs text-subtle">{formatDate(t.lastMessageAt)}</span>
                  </div>
                </div>
                {t.lastMessage && <p className="text-sm text-muted truncate mt-1">{t.lastMessage.bodyText}</p>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {composer}
    </div>
  );
}
