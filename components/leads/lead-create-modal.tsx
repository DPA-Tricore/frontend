'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SlideModal from '@/components/slide-modal';
import FormSection from '@/components/form-section';
import { useAuth } from '@/context/auth-context';
import { colors } from '@/lib/theme/colors';
import { useCreateLead } from '@/lib/hooks/use-leads';
import { useMe } from '@/lib/hooks/use-me';
import { useProducts } from '@/lib/hooks/use-products';
import { useUsers } from '@/lib/hooks/use-users';
import { FORM_INPUT_CLASS } from '@/lib/constants/forms';
import {
  ASSIGNABLE_ROLES,
  CAN_ASSIGN_ROLES,
  LEAD_SOURCE_SUGGESTIONS,
  LEAD_TYPE_OPTIONS,
  NEW_LEAD_FORM,
} from '@/lib/constants/leads';
import { SHOW_REMINDER_DEMO_MODE } from '@/lib/constants/reminders';
import { apiErrorMessage } from '@/lib/utils/api-error';
import { formatDateTime } from '@/lib/utils/date';
import { userDisplayName } from '@/lib/utils/user-name';

interface LeadCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function LeadCreateModal({ isOpen, onClose, onCreated }: LeadCreateModalProps) {
  const [formData, setFormData] = useState(NEW_LEAD_FORM);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [reminderTimes, setReminderTimes] = useState<string[]>([]);
  const [reminderTimeInput, setReminderTimeInput] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Local state, not createLead.isPending: the mutation's pending state reaches React a tick
  // late, so a fast double-click would get through and create the lead twice.
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const createLead = useCreateLead();
  const id = useId();

  // Same rule as the lead page: admins and managers assign, and managers only within their team.
  const { user } = useAuth();
  const canAssign = !!user?.role && CAN_ASSIGN_ROLES.includes(user.role);
  const { data: me } = useMe();
  const { data: users = [] } = useUsers({ enabled: isOpen && canAssign });
  const { data: products = [], isLoading: productsLoading } = useProducts(false, { enabled: isOpen });
  const assignees = users.filter(
    (u) =>
      u.isActive &&
      ASSIGNABLE_ROLES.includes(u.role) &&
      (user?.role !== 'MANAGER' || u.teamId === me?.teamId),
  );

  const reset = () => {
    setFormData(NEW_LEAD_FORM);
    setProductIds([]);
    setReminderTimes([]);
    setReminderTimeInput('');
    setDemoMode(false);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const addReminderTime = () => {
    if (reminderTimeInput && !reminderTimes.includes(reminderTimeInput)) {
      setReminderTimes((prev) => [...prev, reminderTimeInput]);
      setReminderTimeInput('');
    }
  };

  const removeReminderTime = (time: string) => {
    setReminderTimes((prev) => prev.filter((t) => t !== time));
  };

  const toggleProduct = (productId: string) => {
    setProductIds((prev) =>
      prev.includes(productId) ? prev.filter((p) => p !== productId) : [...prev, productId],
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { email, phone, source, coverageAmount, budgetRange, assignedAgentId, ...rest } = formData;
      const lead = await createLead.mutateAsync({
        ...rest,
        // Blank fields are left out. Email and phone become the lead's primary contacts.
        ...(email.trim() && { email: email.trim() }),
        ...(phone.trim() && { phone: phone.trim() }),
        ...(source.trim() && { source: source.trim() }),
        ...(coverageAmount && { coverageAmount: Number(coverageAmount) }),
        ...(budgetRange.trim() && { budgetRange: budgetRange.trim() }),
        ...(assignedAgentId && { assignedAgentId }),
        ...(productIds.length > 0 && { interestedProductIds: productIds }),
        ...(reminderTimes.length > 0 && {
          reminderTimes: reminderTimes.map((t) => new Date(t).toISOString()),
        }),
        ...(demoMode && { demoMode: true }),
      });
      reset();
      onClose();
      onCreated?.();
      toast.success('Lead created', {
        description: `${lead.firstName} ${lead.lastName}`,
        action: { label: 'View', onClick: () => router.push(`/leads/${lead.id}`) },
      });
    } catch (err) {
      setError(apiErrorMessage(err, 'Failed to create lead'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SlideModal isOpen={isOpen} onClose={handleClose} title="Create New Lead" size="wide">
      <form onSubmit={handleSubmit} className="min-h-full flex flex-col">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6 pb-6">
          <FormSection title="Basic info">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${id}-firstName`} className="block text-sm font-medium text-muted mb-1.5">
                  First name *
                </label>
                <input
                  id={`${id}-firstName`}
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className={FORM_INPUT_CLASS}
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor={`${id}-lastName`} className="block text-sm font-medium text-muted mb-1.5">
                  Last name *
                </label>
                <input
                  id={`${id}-lastName`}
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className={FORM_INPUT_CLASS}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${id}-leadType`} className="block text-sm font-medium text-muted mb-1.5">
                  Lead type
                </label>
                <select
                  id={`${id}-leadType`}
                  name="leadType"
                  value={formData.leadType}
                  onChange={handleInputChange}
                  className={FORM_INPUT_CLASS}
                >
                  {LEAD_TYPE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`${id}-source`} className="block text-sm font-medium text-muted mb-1.5">
                  Source
                </label>
                <input
                  id={`${id}-source`}
                  type="text"
                  name="source"
                  list={`${id}-sources`}
                  value={formData.source}
                  onChange={handleInputChange}
                  className={FORM_INPUT_CLASS}
                  placeholder="e.g. Referral"
                />
                <datalist id={`${id}-sources`}>
                  {LEAD_SOURCE_SUGGESTIONS.map((source) => (
                    <option key={source} value={source} />
                  ))}
                </datalist>
              </div>
            </div>
          </FormSection>

          <FormSection title="Contact">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${id}-email`} className="block text-sm font-medium text-muted mb-1.5">
                  Email
                </label>
                <input
                  id={`${id}-email`}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={FORM_INPUT_CLASS}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor={`${id}-phone`} className="block text-sm font-medium text-muted mb-1.5">
                  Phone
                </label>
                <input
                  id={`${id}-phone`}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={FORM_INPUT_CLASS}
                  placeholder="+1 555 0100"
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Insurance interest">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${id}-coverage`} className="block text-sm font-medium text-muted mb-1.5">
                  Coverage amount
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-subtle">
                    $
                  </span>
                  <input
                    id={`${id}-coverage`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    name="coverageAmount"
                    value={formData.coverageAmount}
                    onChange={handleInputChange}
                    className={`${FORM_INPUT_CLASS} pl-7`}
                    placeholder="50000"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={`${id}-budget`} className="block text-sm font-medium text-muted mb-1.5">
                  Budget
                </label>
                <input
                  id={`${id}-budget`}
                  type="text"
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleInputChange}
                  className={FORM_INPUT_CLASS}
                  placeholder="e.g. $100–200 a month"
                />
              </div>
            </div>
            <div>
              <p className="block text-sm font-medium text-muted mb-1.5">Products of interest</p>
              {productsLoading ? (
                <p className="text-sm text-subtle">Loading products…</p>
              ) : products.length === 0 ? (
                <p className="text-sm text-subtle">No products set up yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {products.map((product) => {
                    const active = productIds.includes(product.id);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleProduct(product.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-[var(--border)] text-muted hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {product.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title={canAssign ? 'Assignment & follow-up' : 'Follow-up'}>
            {canAssign && (
              <div>
                <label htmlFor={`${id}-assignee`} className="block text-sm font-medium text-muted mb-1.5">
                  Assigned to
                </label>
                <select
                  id={`${id}-assignee`}
                  name="assignedAgentId"
                  value={formData.assignedAgentId}
                  onChange={handleInputChange}
                  className={FORM_INPUT_CLASS}
                >
                  <option value="">Unassigned</option>
                  {assignees.map((u) => (
                    <option key={u.id} value={u.id}>
                      {userDisplayName(u)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor={`${id}-reminder`} className="block text-sm font-medium text-muted mb-1.5">
                Follow-up reminders
              </label>
              <div className="flex gap-2 items-center">
                <input
                  id={`${id}-reminder`}
                  type="datetime-local"
                  value={reminderTimeInput}
                  onChange={(e) => setReminderTimeInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
                />
                <button
                  type="button"
                  onClick={addReminderTime}
                  disabled={!reminderTimeInput}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-muted hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + Add
                </button>
              </div>

              {reminderTimes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {reminderTimes.map((time) => (
                    <span
                      key={time}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white"
                    >
                      {formatDateTime(time)}
                      <button
                        type="button"
                        onClick={() => removeReminderTime(time)}
                        className="hover:opacity-70 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {SHOW_REMINDER_DEMO_MODE && reminderTimes.length > 0 && (
                <label className="inline-flex items-center gap-2 mt-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={demoMode}
                    onChange={(e) => setDemoMode(e.target.checked)}
                    className="w-4 h-4 rounded accent-orange-500"
                  />
                  <span className="text-xs text-orange-600 font-medium">
                    Fire immediately (demo mode)
                  </span>
                </label>
              )}
            </div>
          </FormSection>
        </div>

        {/* Pinned to the bottom of the panel, so the buttons stay in reach on a long form. */}
        <div className="mt-auto sticky bottom-0 -mx-6 -mb-6 px-6 py-4 border-t border-[var(--border)] surface flex justify-end gap-3">
          <button type="button" onClick={handleClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`${colors.button.primary} flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? 'Creating…' : 'Create Lead'}
          </button>
        </div>
      </form>
    </SlideModal>
  );
}
