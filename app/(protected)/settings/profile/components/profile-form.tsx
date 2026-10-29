'use client';

import { useEffect, useState } from 'react';
import { useMe, useUpdateMe } from '@/lib/hooks/use-me';
import { colors } from '@/lib/theme/colors';
import { FORM_INPUT_CLASS } from '@/lib/constants/forms';

export default function ProfileForm() {
  const { data: me } = useMe();
  const updateMe = useUpdateMe();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!me) return;
    setFirstName(me.firstName ?? '');
    setLastName(me.lastName ?? '');
  }, [me]);

  const isDirty = !!me && (firstName.trim() !== (me.firstName ?? '') || lastName.trim() !== (me.lastName ?? ''));
  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || !isValid) return;
    setSaved(false);
    await updateMe.mutateAsync({ firstName: firstName.trim(), lastName: lastName.trim() });
    setSaved(true);
  };

  const error = (updateMe.error as any)?.response?.data?.message;

  return (
    <form onSubmit={handleSave} className="surface rounded-xl border border-[var(--border)] shadow-sm p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-primary">Your name</h2>
        <p className="text-sm text-muted">It shows on tasks and leads, and on emails you send to clients.</p>
      </div>

      {me && !me.firstName && !me.lastName && (
        <div className="callout p-3 rounded-lg text-sm">Add your name so clients know who they&apos;re hearing from.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-sm font-medium text-primary">First name</span>
          <input
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setSaved(false); }}
            className={FORM_INPUT_CLASS}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-primary">Last name</span>
          <input
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setSaved(false); }}
            className={FORM_INPUT_CLASS}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isDirty || !isValid || updateMe.isPending}
          className={`${colors.button.secondary} text-sm disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {updateMe.isPending ? 'Saving…' : 'Save'}
        </button>
        {saved && !isDirty && <span className="text-sm text-muted">Saved</span>}
        {error && <span className="text-sm text-red-600">{Array.isArray(error) ? error[0] : error}</span>}
      </div>

      {me && <p className="text-xs text-muted">Signed in as {me.email}</p>}
    </form>
  );
}
