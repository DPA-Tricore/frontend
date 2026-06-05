'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useReminders } from '@/lib/hooks/use-reminders';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';

interface ReminderCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
  leadId?: string;
  initialData?: {
    title: string;
    description?: string;
    dueDate: Date;
  };
  onSuccess?: (reminder: any) => void;
}

const calculateReminderTime = (dueDate: string, dueTime: string, offset: string): string => {
  const date = new Date(`${dueDate}T${dueTime}`);
  switch (offset) {
    case 'before-1-hour':
      date.setHours(date.getHours() - 1);
      break;
    case 'before-1-day':
      date.setDate(date.getDate() - 1);
      break;
    case 'before-3-days':
      date.setDate(date.getDate() - 3);
      break;
  }
  return date.toISOString();
};

export default function ReminderCreateModal({
  isOpen,
  onClose,
  taskId,
  leadId,
  initialData,
  onSuccess,
}: ReminderCreateModalProps) {
  const { createReminder } = useReminders();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || 'Task Reminder',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    dueTime: '09:00',
    reminderOffset: 'before-1-day',
  });

  useEffect(() => {
    if (!isOpen) setError(null);
  }, [isOpen]);

  const reset = () => {
    setFormData({
      title: 'Task Reminder',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '09:00',
      reminderOffset: 'before-1-day',
    });
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await createReminder({
        title: formData.title,
        description: formData.description || undefined,
        dueDate: new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString(),
        reminderTime: calculateReminderTime(formData.dueDate, formData.dueTime, formData.reminderOffset),
        ...(taskId && { taskId }),
        ...(leadId && { leadId }),
      });
      onSuccess?.(result);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create reminder');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SlideModal isOpen={isOpen} onClose={handleClose} title="Create Reminder">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="e.g., Follow up with client"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Description (Optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="Add notes..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Due Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-subtle" />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 w-4 h-4 text-subtle" />
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueTime: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Remind Me</label>
          <select
            value={formData.reminderOffset}
            onChange={(e) => setFormData((prev) => ({ ...prev, reminderOffset: e.target.value }))}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
          >
            <option value="on-due-date">On due date</option>
            <option value="before-1-hour">1 hour before</option>
            <option value="before-1-day">1 day before</option>
            <option value="before-3-days">3 days before</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={handleClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className={colors.button.primary}>
            {isLoading ? 'Creating...' : 'Create Reminder'}
          </button>
        </div>
      </form>
    </SlideModal>
  );
}
