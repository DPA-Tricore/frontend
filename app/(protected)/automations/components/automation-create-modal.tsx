'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { automationsApi } from '@/lib/api/automations';
import { automationKeys } from '@/lib/queries/keys';
import { AutomationScope } from '@/lib/types/automations';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';

const LEAD_STATUSES = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'IN_NEGOTIATION', label: 'In Negotiation' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
  { value: 'UNRESPONSIVE', label: 'Unresponsive' },
];

interface AutomationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AutomationCreateModal({ isOpen, onClose }: AutomationCreateModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    stage: 'NEW',
    scope: AutomationScope.GLOBAL,
    shotClockDays: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setFormData({ name: '', stage: 'NEW', scope: AutomationScope.GLOBAL, shotClockDays: '' });
    setError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const automation = await automationsApi.createAutomation({
        name: formData.name,
        stage: formData.stage,
        scope: formData.scope,
        ...(formData.shotClockDays ? { shotClockDays: parseInt(formData.shotClockDays) } : {}),
      });
      queryClient.invalidateQueries({ queryKey: automationKeys.list() });
      reset();
      onClose();
      router.push(`/automations/${automation.id}`);
    } catch {
      setError('Failed to create automation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SlideModal isOpen={isOpen} onClose={handleClose} title="New Automation">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="e.g., New Lead Follow-up"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Triggers on Stage *</label>
          <select
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Scope</label>
          <select
            name="scope"
            value={formData.scope}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
          >
            <option value={AutomationScope.GLOBAL}>Global — applies to all leads</option>
            <option value={AutomationScope.USER}>Per-user — applies to my leads only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Shot Clock <span className="text-xs text-subtle font-normal">(days before recycling, optional)</span>
          </label>
          <input
            type="number"
            name="shotClockDays"
            value={formData.shotClockDays}
            onChange={handleChange}
            min={1}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="e.g., 45"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={handleClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className={colors.button.primary}>
            {loading ? 'Creating...' : 'Create & Add Steps'}
          </button>
        </div>
      </form>
    </SlideModal>
  );
}
