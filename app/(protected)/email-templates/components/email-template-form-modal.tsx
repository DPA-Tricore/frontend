'use client';

import { useRef, useState } from 'react';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';
import { FORM_INPUT_CLASS } from '@/lib/constants/forms';
import { apiErrorMessage } from '@/lib/utils/api-error';
import {
  EMAIL_BODY_MAX_LENGTH,
  EMAIL_SUBJECT_MAX_LENGTH,
  EMAIL_TEMPLATE_FORM_DEFAULTS,
  EMAIL_TEMPLATE_NAME_MAX_LENGTH,
  MERGE_FIELDS,
} from '@/lib/constants/emails';
import { useCreateEmailTemplate, useDeleteEmailTemplate, useUpdateEmailTemplate } from '@/lib/hooks/use-email-templates';
import type { EmailTemplateResponseDto } from '@/lib/types/emails';
import { useResetOnOpen } from '@/lib/hooks/use-reset-on-open';

interface EmailTemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Leave out to add a new template.
  template?: EmailTemplateResponseDto | null;
}

type FieldTarget = 'subject' | 'body';

export default function EmailTemplateFormModal({ isOpen, onClose, template }: EmailTemplateFormModalProps) {
  const [form, setForm] = useState(EMAIL_TEMPLATE_FORM_DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  // Which box a merge-field chip goes into: the last one the cursor was in.
  const [target, setTarget] = useState<FieldTarget>('body');
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const createTemplate = useCreateEmailTemplate();
  const updateTemplate = useUpdateEmailTemplate();
  const deleteTemplate = useDeleteEmailTemplate();
  const isEdit = !!template;
  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  useResetOnOpen(isOpen, () => {
    setError(null);
    setTarget('body');
    setForm(
      template
        ? { name: template.name, subject: template.subject, body: template.body, isActive: template.isActive }
        : EMAIL_TEMPLATE_FORM_DEFAULTS,
    );
  });

  const insertField = (name: string) => {
    const el = target === 'subject' ? subjectRef.current : bodyRef.current;
    const token = `{{${name}}}`;
    const current = form[target];
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    setForm((prev) => ({ ...prev, [target]: current.slice(0, start) + token + current.slice(end) }));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: form.name.trim(), subject: form.subject.trim(), body: form.body, isActive: form.isActive };
    try {
      if (template) {
        await updateTemplate.mutateAsync({ id: template.id, data });
      } else {
        await createTemplate.mutateAsync(data);
      }
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, 'Failed to save template'));
    }
  };

  const handleDelete = async () => {
    if (!template) return;
    if (!confirm(`Delete "${template.name}"? Emails already sent with it stay as they are.`)) return;
    try {
      await deleteTemplate.mutateAsync(template.id);
      onClose();
    } catch {
      setError('Failed to delete template');
    }
  };

  return (
    <SlideModal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Template' : 'New Template'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Name</label>
          <input
            type="text"
            value={form.name}
            maxLength={EMAIL_TEMPLATE_NAME_MAX_LENGTH}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
            className={FORM_INPUT_CLASS}
            placeholder="Renewal reminder — 30 days"
          />
          <p className="text-xs text-subtle mt-1">Only your team sees this.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Subject</label>
          <input
            ref={subjectRef}
            type="text"
            value={form.subject}
            maxLength={EMAIL_SUBJECT_MAX_LENGTH}
            onFocus={() => setTarget('subject')}
            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            required
            className={FORM_INPUT_CLASS}
            placeholder="Your {{policyName}} renews on {{renewalDate}}"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Message</label>
          <textarea
            ref={bodyRef}
            value={form.body}
            maxLength={EMAIL_BODY_MAX_LENGTH}
            onFocus={() => setTarget('body')}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            required
            rows={12}
            className={`${FORM_INPUT_CLASS} resize-y`}
            placeholder={'Hi {{firstName}},\n\n…\n\n{{agentName}}\n{{agencyName}}'}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-muted mb-2">Insert a field</p>
          <div className="flex flex-wrap gap-2">
            {MERGE_FIELDS.map((f) => (
              <button
                key={f.name}
                type="button"
                title={f.description}
                onClick={() => insertField(f.name)}
                className="px-2 py-1 rounded-md border border-[var(--border)] text-xs text-primary font-mono interactive"
              >
                {`{{${f.name}}}`}
              </button>
            ))}
          </div>
          <p className="text-xs text-subtle mt-2">
            Fields are filled in for each client when an agent picks the template. If a client has no value — say, no
            policy yet — the agent has to fill it in before sending.
          </p>
        </div>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-medium text-primary">Active</p>
            <p className="text-xs text-subtle">Inactive templates are hidden from the email composer.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.isActive}
            onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
              form.isActive ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                form.isActive ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className={`${colors.button.primary} disabled:opacity-50`}>
            {isSaving ? 'Saving…' : isEdit ? 'Save' : 'Add Template'}
          </button>
        </div>

        {isEdit && (
          <div className="pt-4 border-t border-[var(--border)]">
            <button type="button" onClick={handleDelete} className="text-sm text-red-600 hover:underline">
              Delete template
            </button>
          </div>
        )}
      </form>
    </SlideModal>
  );
}
