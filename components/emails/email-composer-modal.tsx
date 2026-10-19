'use client';

import { useEffect, useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';
import { FORM_INPUT_CLASS } from '@/lib/constants/forms';
import {
  EMAIL_BODY_MAX_LENGTH, EMAIL_MAX_ATTACHMENT_BYTES, EMAIL_MAX_ATTACHMENTS, EMAIL_SUBJECT_MAX_LENGTH,
} from '@/lib/constants/emails';
import { useLeadDocuments } from '@/lib/hooks/use-lead-detail';
import { formatBytes } from '@/lib/utils/format';
import { useSendEmail } from '@/lib/hooks/use-emails';
import { useEmailTemplates, useRenderEmailTemplate } from '@/lib/hooks/use-email-templates';
import { unfilledMergeFields } from '@/lib/utils/merge-fields';
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
  const renderTemplate = useRenderEmailTemplate();
  const { data: templates = [] } = useEmailTemplates(false, { enabled: isOpen });
  const [templateId, setTemplateId] = useState('');
  // Only leads have a Documents tab, so only lead emails can attach.
  const { data: documents = [] } = useLeadDocuments(isOpen && party.type === 'lead' ? party.id : '');
  const [documentIds, setDocumentIds] = useState<string[]>([]);
  const emailContacts = contacts.filter((c) => c.type === 'EMAIL');
  const [to, setTo] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');

  // Reset every time the composer opens: a reply starts from the thread, a new email from the primary contact.
  useEffect(() => {
    if (!isOpen) return;
    const usable = emailContacts.filter((c) => !c.doNotContact && !c.bouncedAt);
    const firstUsable = usable.find((c) => c.isPrimary) ?? usable[0];
    // A reply can only go to the record's own addresses — someone cc'd on the thread isn't one.
    const replyTo = reply ? usable.filter((c) => reply.to.some((a) => a.toLowerCase() === c.value.toLowerCase())).map((c) => c.value) : [];
    setTo(replyTo.length ? replyTo : firstUsable ? [firstUsable.value] : []);
    setSubject(reply?.subject ?? '');
    setBodyText('');
    setTemplateId('');
    setDocumentIds([]);
    sendEmail.reset();
    renderTemplate.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reply]);

  const toggleRecipient = (address: string) =>
    setTo((prev) => (prev.includes(address) ? prev.filter((a) => a !== address) : [...prev, address]));

  // Picking a template fills it in for this client. A reply keeps the thread's subject.
  const handlePickTemplate = async (id: string) => {
    setTemplateId(id);
    if (!id) return;
    const rendered = await renderTemplate.mutateAsync({
      id,
      party: party.type === 'lead' ? { leadId: party.id } : { customerId: party.id },
    });
    if (!reply) setSubject(rendered.subject);
    setBodyText(rendered.bodyText);
  };

  const toggleDocument = (id: string) =>
    setDocumentIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  const attachedBytes = documents.filter((d) => documentIds.includes(d.id)).reduce((sum, d) => sum + d.fileSize, 0);
  const tooBig = attachedBytes > EMAIL_MAX_ATTACHMENT_BYTES;

  const unfilled = unfilledMergeFields(subject, bodyText);
  const isValid = to.length > 0 && subject.trim().length > 0 && bodyText.trim().length > 0 && unfilled.length === 0 && !tooBig;

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
      ...(templateId ? { templateId } : {}),
      ...(documentIds.length ? { documentIds } : {}),
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
                <label key={c.id} className={`flex items-center gap-2 text-sm ${c.doNotContact || c.bouncedAt ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={to.includes(c.value)}
                    disabled={c.doNotContact || !!c.bouncedAt}
                    onChange={() => toggleRecipient(c.value)}
                  />
                  <span className="text-primary">{c.value}</span>
                  {c.isPrimary && <span className="text-xs text-subtle">Primary</span>}
                  {c.doNotContact && <span className="text-xs text-subtle">Do not contact</span>}
                  {c.bouncedAt && <span className="text-xs text-red-600">Bounced — check the address</span>}
                </label>
              ))}
            </div>
          )}
        </div>

        {templates.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Template</label>
            <select
              value={templateId}
              onChange={(e) => handlePickTemplate(e.target.value)}
              disabled={renderTemplate.isPending}
              className={FORM_INPUT_CLASS}
            >
              <option value="">No template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

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

        {party.type === 'lead' && (
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Attach from Documents</label>
            {documents.length === 0 && (
              <p className="text-sm text-subtle">
                No documents on this lead yet. Upload files in the Documents tab, then attach them here.
              </p>
            )}
            <div className="space-y-2">
              {documents.map((d) => {
                const checked = documentIds.includes(d.id);
                const atLimit = !checked && documentIds.length >= EMAIL_MAX_ATTACHMENTS;
                return (
                  <label key={d.id} className={`flex items-center gap-2 text-sm ${atLimit ? 'opacity-50' : ''}`}>
                    <input type="checkbox" checked={checked} disabled={atLimit} onChange={() => toggleDocument(d.id)} />
                    <Paperclip size={14} className="text-subtle flex-shrink-0" />
                    <span className="text-primary truncate">{d.originalName}</span>
                    <span className="text-xs text-subtle flex-shrink-0">{formatBytes(d.fileSize)}</span>
                  </label>
                );
              })}
            </div>
            {tooBig && (
              <p className="text-xs text-red-600 mt-2">
                Attachments add up to {formatBytes(attachedBytes)} — keep them under {formatBytes(EMAIL_MAX_ATTACHMENT_BYTES)}.
              </p>
            )}
          </div>
        )}

        {unfilled.length > 0 && (
          <div className="callout p-3 rounded-lg text-sm">
            Fill in or remove {unfilled.map((n) => `{{${n}}}`).join(', ')} before sending — this client has no value for{' '}
            {unfilled.length === 1 ? 'it' : 'them'}.
          </div>
        )}

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
