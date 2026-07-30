'use client';

import { useState } from 'react';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';
import { useCreateLead } from '@/lib/hooks/use-leads';

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

interface LeadCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function LeadCreateModal({ isOpen, onClose, onCreated }: LeadCreateModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    leadType: 'PROSPECT',
    status: 'NEW',
  });
  const [reminderTimes, setReminderTimes] = useState<string[]>([]);
  const [reminderTimeInput, setReminderTimeInput] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createLead = useCreateLead();

  const reset = () => {
    setFormData({ firstName: '', lastName: '', leadType: 'PROSPECT', status: 'NEW' });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead.mutateAsync({
        ...formData,
        ...(reminderTimes.length > 0 && {
          reminderTimes: reminderTimes.map((t) => new Date(t).toISOString()),
        }),
        ...(demoMode && { demoMode: true }),
      });
      reset();
      onClose();
      onCreated();
    } catch {
      setError('Failed to create lead');
    }
  };

  return (
    <SlideModal isOpen={isOpen} onClose={handleClose} title="Create New Lead">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted mb-2">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Lead Type</label>
          <select
            name="leadType"
            value={formData.leadType}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
          >
            <option value="PROSPECT">Prospect</option>
            <option value="WARM_LEAD">Warm Lead</option>
            <option value="QUALIFIED_LEAD">Qualified Lead</option>
            <option value="OPPORTUNITY">Opportunity</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
          >
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="IN_NEGOTIATION">In Negotiation</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
            <option value="UNRESPONSIVE">Unresponsive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-3">
            Follow-up Reminders{' '}
            <span className="text-xs text-subtle font-normal">(optional)</span>
          </label>
          <div className="flex gap-2 items-center">
            <input
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

          {reminderTimes.length > 0 && (
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

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={handleClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button type="submit" className={colors.button.primary}>
            Create Lead
          </button>
        </div>
      </form>
    </SlideModal>
  );
}
