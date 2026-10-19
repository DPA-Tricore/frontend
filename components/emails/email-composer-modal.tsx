'use client';

import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';
import { FORM_INPUT_CLASS } from '@/lib/constants/forms';
import { EMAIL_BODY_MAX_LENGTH, EMAIL_SUBJECT_MAX_LENGTH } from '@/lib/constants/emails';
import { useSendEmail } from '@/lib/hooks/use-emails';
import type { ContactResponseDto } from '@/lib/types/leads';
import type { EmailParty } from '@/lib/types/emails';

/** Pre-filled when replying inside an existing thread. */
export interface ComposerReply {
  threadId: string;
  subject: string;
  to: string[];
}

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  party: EmailParty;
  contacts: ContactResponseDto[];
  reply?: ComposerReply | null;
  onSent?: (threadId: string) => void;
}

export default function EmailComposerModal({ isOpen, onClose, party, contacts, reply, onSent }: EmailComposerModalProps) {
  const sendEmail = useSendEmail();
  const emailContacts = contacts.filter((c) => c.type === 'EMAIL');
  const [to, setTo] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');

  // Reset every time the composer opens: a reply starts from the thread, a new email from the primary contact.
  useEffect(() => {
    if (!isOpen) return;
    const firstUsable = emailContacts.find((c) => c.isPrimary && !c.doNotContact) ?? emailContacts.find((c) => !c.doNotContact);
    setTo(reply ? reply.to : firstUsable ? [firstUsable.value] : []);
    setSubject(reply?.subject ?? '');
    setBodyText('');
    sendEmail.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reply]);

  const toggleRecipient = (address: string) =>
    setTo((prev) => (prev.includes(address) ? prev.filter((a) => a !== address) : [...prev, address]));

  const isValid = to.length > 0 && subject.trim().length > 0 && bodyText.trim().length > 0;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const message = await sendEmail.mutateAsync({
      ...(reply
        ? { threadId: reply.threadId }
        : party.type === 'lead' ? { leadId: party.id } : { customerId: party.id }),
      to,
      subject: subject.trim(),
      bodyText,
    });
    onSent?.(message.threadId);
    onClose();
  };

  const apiError = (sendEmail.error as any)?.response?.data?.message;

  return (
    <SlideModal isOpen={isOpen} onClose={onClose} title={reply ? 'Reply' : `Email ${party.name}`}>
      <form onSubmit={handleSend} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-muted mb-2">To</label>
          {emailContacts.length === 0 ? (
            <p className="text-sm text-subtle">No email address on file. Add one under Contacts first.</p>
          ) : (
            <div className="space-y-2">
              {emailContacts.map((c) => (
                <label key={c.id} className={`flex items-center gap-2 text-sm ${c.doNotContact ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={to.includes(c.value)}
                    disabled={c.doNotContact}
                    onChange={() => toggleRecipient(c.value)}
                  />
                  <span className="text-primary">{c.value}</span>
                  {c.isPrimary && <span className="text-xs text-subtle">Primary</span>}
                  {c.doNotContact && <span className="text-xs text-subtle">Do not contact</span>}
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            maxLength={EMAIL_SUBJECT_MAX_LENGTH}
            onChange={(e) => setSubject(e.target.value)}
            className={FORM_INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Message</label>
          <textarea
            value={bodyText}
            maxLength={EMAIL_BODY_MAX_LENGTH}
            onChange={(e) => setBodyText(e.target.value)}
            rows={12}
            placeholder={`Hi ${party.name.split(' ')[0]},`}
            className={`${FORM_INPUT_CLASS} resize-y`}
          />
        </div>

        {apiError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {Array.isArray(apiError) ? apiError[0] : apiError}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || sendEmail.isPending}
            className={`${colors.button.primary} flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Send size={16} />
            {sendEmail.isPending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>
    </SlideModal>
  );
}
