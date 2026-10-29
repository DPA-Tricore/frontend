'use client';

import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { CONTACT_EDITOR_ROLES, CONTACT_ICONS, CONTACT_TYPE_LABELS } from '@/lib/constants/leads';
import { contactHref } from '@/lib/utils/contact-links';
import { useAddContact, useRemoveContact, useUpdateContact } from '@/lib/hooks/use-contacts';
import type { ContactOwner, ContactResponseDto } from '@/lib/types/leads';
import { apiErrorMessage } from '@/lib/utils/api-error';
import ContactForm, { type ContactFormValues } from './contact-form';

interface ContactsSectionProps {
  owner: ContactOwner;
  contacts: ContactResponseDto[];
}

// The Contact block at the top of a lead's or customer's side panel.
export default function ContactsSection({ owner, contacts }: ContactsSectionProps) {
  const { user } = useAuth();
  const canEdit = !!user?.role && CONTACT_EDITOR_ROLES.includes(user.role);
  const addContact = useAddContact(owner);
  const updateContact = useUpdateContact(owner);
  const removeContact = useRemoveContact(owner);

  // 'new' while adding, a contact id while editing that row.
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = (id: string | null) => {
    setError(null);
    setEditing(id);
  };

  const handleAdd = async (v: ContactFormValues) => {
    try {
      await addContact.mutateAsync({ type: v.type, value: v.value, isPrimary: v.isPrimary || undefined, doNotContact: v.doNotContact });
      open(null);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not add the contact'));
    }
  };

  const handleSave = async (contact: ContactResponseDto, v: ContactFormValues) => {
    try {
      await updateContact.mutateAsync({
        id: contact.id,
        data: {
          ...(v.value !== contact.value && { value: v.value }),
          ...(v.doNotContact !== contact.doNotContact && { doNotContact: v.doNotContact }),
          // Unticking primary isn't a thing — another contact has to take it over.
          ...(v.isPrimary && !contact.isPrimary && { isPrimary: true }),
        },
      });
      open(null);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save the contact'));
    }
  };

  const handleRemove = async (contact: ContactResponseDto) => {
    if (!confirm(`Remove ${contact.value}?`)) return;
    try {
      await removeContact.mutateAsync(contact.id);
      open(null);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not remove the contact'));
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-subtle uppercase tracking-wide">Contact</p>
        {canEdit && editing !== 'new' && (
          <button onClick={() => open('new')} className="flex items-center gap-1 text-xs text-muted interactive" title="Add contact">
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {contacts.length === 0 && editing !== 'new' && <p className="text-xs text-subtle mb-1">No contact details yet.</p>}

      <div className="space-y-1 mb-1">
        {contacts.map((c) => {
          if (editing === c.id) {
            return (
              <ContactForm
                key={c.id}
                contact={c}
                saving={updateContact.isPending || removeContact.isPending}
                error={error}
                onSave={(v) => handleSave(c, v)}
                onCancel={() => open(null)}
                onDelete={() => handleRemove(c)}
              />
            );
          }
          const Icon = CONTACT_ICONS[c.type];
          const href = c.doNotContact ? null : contactHref(c);
          const meta = [CONTACT_TYPE_LABELS[c.type], c.isPrimary && 'primary', c.doNotContact && 'do not contact'].filter(Boolean).join(' · ');
          const body = (
            <>
              <span className="w-7 h-7 rounded-full bg-gray-500/10 flex items-center justify-center shrink-0 text-subtle">
                <Icon size={13} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-primary truncate">{c.value}</span>
                <span className="block text-xs text-subtle">
                  {meta}
                  {c.bouncedAt && <span className="text-red-600"> · bounced</span>}
                </span>
              </span>
            </>
          );
          return (
            <div key={c.id} className={`group flex items-center gap-1 -mx-1.5 px-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 ${c.doNotContact ? 'opacity-50' : ''}`}>
              {href ? (
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2.5 py-1.5 flex-1 min-w-0"
                >
                  {body}
                </a>
              ) : (
                <div className="flex items-center gap-2.5 py-1.5 flex-1 min-w-0">{body}</div>
              )}
              {canEdit && (
                <button
                  onClick={() => open(c.id)}
                  className="p-1 text-subtle opacity-0 group-hover:opacity-100 focus:opacity-100 interactive rounded"
                  title={`Edit ${c.value}`}
                >
                  <Pencil size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {editing === 'new' && (
        <ContactForm saving={addContact.isPending} error={error} onSave={handleAdd} onCancel={() => open(null)} />
      )}
    </>
  );
}
