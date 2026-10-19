'use client';

import { useState } from 'react';
import { CONTACT_TYPE_LABELS, CONTACT_VALUE_PLACEHOLDERS } from '@/lib/constants/leads';
import { ContactType } from '@/lib/types/leads';
import type { ContactResponseDto } from '@/lib/types/leads';
import { COMPACT_INPUT_CLASS } from '@/lib/constants/forms';

export interface ContactFormValues {
  type: ContactType;
  value: string;
  isPrimary: boolean;
  doNotContact: boolean;
}

interface ContactFormProps {
  /** Leave out to add a new contact. */
  contact?: ContactResponseDto;
  saving: boolean;
  error: string | null;
  onSave: (values: ContactFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function ContactForm({ contact, saving, error, onSave, onCancel, onDelete }: ContactFormProps) {
  const [values, setValues] = useState<ContactFormValues>({
    type: contact?.type ?? ContactType.EMAIL,
    value: contact?.value ?? '',
    isPrimary: contact?.isPrimary ?? false,
    doNotContact: contact?.doNotContact ?? false,
  });
  const set = <K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) => setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (values.value.trim()) onSave({ ...values, value: values.value.trim() });
      }}
      className="space-y-2 p-2.5 rounded-lg border border-[var(--border)] my-1.5"
    >
      {!contact && (
        <select value={values.type} onChange={(e) => set('type', e.target.value as ContactType)} className={COMPACT_INPUT_CLASS}>
          {Object.values(ContactType).map((t) => (
            <option key={t} value={t}>{CONTACT_TYPE_LABELS[t]}</option>
          ))}
        </select>
      )}
      <input
        autoFocus
        type={values.type === ContactType.EMAIL ? 'email' : 'text'}
        value={values.value}
        onChange={(e) => set('value', e.target.value)}
        placeholder={CONTACT_VALUE_PLACEHOLDERS[values.type] ?? ''}
        className={COMPACT_INPUT_CLASS}
      />
      {contact?.bouncedAt && <p className="text-xs text-red-600">Emails to this address bounced. Fixing the address clears that.</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
          <input type="checkbox" checked={values.isPrimary} onChange={(e) => set('isPrimary', e.target.checked)} />
          Primary
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
          <input type="checkbox" checked={values.doNotContact} onChange={(e) => set('doNotContact', e.target.checked)} />
          Do not contact
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-3 pt-0.5">
        <button type="submit" disabled={saving || !values.value.trim()} className="text-xs font-medium text-primary interactive disabled:opacity-40">
          {saving ? 'Saving…' : contact ? 'Save' : 'Add'}
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-muted interactive">
          Cancel
        </button>
        {onDelete && (
          <button type="button" onClick={onDelete} disabled={saving} className="ml-auto text-xs text-red-600 hover:underline disabled:opacity-40">
            Remove
          </button>
        )}
      </div>
    </form>
  );
}
