'use client';

import { useState, useEffect } from 'react';
import { automationsApi } from '@/lib/api/automations';
import { AutomationActionType } from '@/lib/types/automations';
import type { AutomationStepResponseDto } from '@/lib/types/automations';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';

const ACTION_TYPES = [
  { value: AutomationActionType.EMAIL, label: 'Send Email' },
  { value: AutomationActionType.SMS, label: 'Send SMS' },
  { value: AutomationActionType.CALL_TASK, label: 'Call Task' },
  { value: AutomationActionType.TODO, label: 'To-Do Task' },
  { value: AutomationActionType.REMINDER, label: 'Reminder' },
  { value: AutomationActionType.TAG, label: 'Tag Lead' },
];

const ACTION_CONFIG_FIELDS: Record<AutomationActionType, { key: string; label: string; placeholder: string }[]> = {
  [AutomationActionType.EMAIL]: [
    { key: 'subject', label: 'Subject', placeholder: "e.g., [[Lead's First Name]], we'll be in touch soon" },
    { key: 'body', label: 'Body', placeholder: 'Email body...' },
  ],
  [AutomationActionType.SMS]: [
    { key: 'message', label: 'Message', placeholder: 'SMS message...' },
  ],
  [AutomationActionType.CALL_TASK]: [
    { key: 'title', label: 'Task Title', placeholder: 'e.g., Call new prospect' },
    { key: 'description', label: 'Description (optional)', placeholder: '' },
  ],
  [AutomationActionType.TODO]: [
    { key: 'title', label: 'To-Do Title', placeholder: 'e.g., Send quote to lead' },
    { key: 'description', label: 'Description (optional)', placeholder: '' },
  ],
  [AutomationActionType.REMINDER]: [
    { key: 'title', label: 'Reminder Title', placeholder: 'e.g., Stale lead in new stage 40 days old' },
    { key: 'message', label: 'Message (optional)', placeholder: '' },
  ],
  [AutomationActionType.TAG]: [
    { key: 'tagName', label: 'Tag Name', placeholder: 'e.g., hot-lead' },
  ],
};

interface StepFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  automationId: string;
  existingStep?: AutomationStepResponseDto | null;
  nextOrder: number;
  onSaved: () => void;
}

export default function StepFormModal({
  isOpen,
  onClose,
  automationId,
  existingStep,
  nextOrder,
  onSaved,
}: StepFormModalProps) {
  const [actionType, setActionType] = useState<AutomationActionType>(AutomationActionType.EMAIL);
  const [dayOffset, setDayOffset] = useState('1');
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingStep) {
      setActionType(existingStep.actionType);
      setDayOffset(String(existingStep.dayOffset));
      setConfigValues(
        Object.fromEntries(
          Object.entries(existingStep.actionConfig).map(([k, v]) => [k, String(v)]),
        ),
      );
    } else {
      setActionType(AutomationActionType.EMAIL);
      setDayOffset('1');
      setConfigValues({});
    }
    setError(null);
  }, [existingStep, isOpen]);

  const handleActionTypeChange = (type: AutomationActionType) => {
    setActionType(type);
    setConfigValues({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await automationsApi.upsertStep(automationId, {
        ...(existingStep ? { id: existingStep.id } : {}),
        dayOffset: parseInt(dayOffset),
        actionType,
        actionConfig: configValues,
        order: existingStep?.order ?? nextOrder,
      });
      onSaved();
      onClose();
    } catch {
      setError('Failed to save step');
    } finally {
      setLoading(false);
    }
  };

  const fields = ACTION_CONFIG_FIELDS[actionType];

  return (
    <SlideModal
      isOpen={isOpen}
      onClose={onClose}
      title={existingStep ? 'Edit Step' : 'Add Step'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Day Offset *</label>
          <input
            type="number"
            value={dayOffset}
            onChange={(e) => setDayOffset(e.target.value)}
            min={0}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="e.g., 1"
          />
          <p className="text-xs text-subtle mt-1">Days after lead enters the stage</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Action Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {ACTION_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleActionTypeChange(value as AutomationActionType)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-left ${
                  actionType === value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-[var(--border)] text-muted hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-muted">Configuration</label>
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-subtle mb-1">{label}</label>
              <input
                type="text"
                value={configValues[key] ?? ''}
                onChange={(e) => setConfigValues((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary text-sm"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className={colors.button.primary}>
            {loading ? 'Saving...' : existingStep ? 'Save Changes' : 'Add Step'}
          </button>
        </div>
      </form>
    </SlideModal>
  );
}
