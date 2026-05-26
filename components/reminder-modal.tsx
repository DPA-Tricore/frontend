'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useReminders } from '@/lib/hooks/use-reminders';
import SlideModal from './slide-modal';

interface ReminderModalProps {
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

export default function ReminderModal({
  isOpen,
  onClose,
  taskId,
  leadId,
  initialData,
  onSuccess,
}: ReminderModalProps) {
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
    reminderTime: 'before-1-day',
  });

  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const calculateReminderTime = () => {
    const dueDateStr = `${formData.dueDate}T${formData.dueTime}`;
    const dueDate = new Date(dueDateStr);

    switch (formData.reminderTime) {
      case 'on-due-date':
        return dueDate.toISOString();
      case 'before-1-hour':
        const oneHourBefore = new Date(dueDate);
        oneHourBefore.setHours(oneHourBefore.getHours() - 1);
        return oneHourBefore.toISOString();
      case 'before-1-day':
        const oneDayBefore = new Date(dueDate);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);
        return oneDayBefore.toISOString();
      case 'before-3-days':
        const threeDaysBefore = new Date(dueDate);
        threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
        return threeDaysBefore.toISOString();
      default:
        return dueDate.toISOString();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const dueDateStr = `${formData.dueDate}T${formData.dueTime}`;

      const reminderData = {
        title: formData.title,
        description: formData.description || undefined,
        dueDate: new Date(dueDateStr).toISOString(),
        reminderTime: calculateReminderTime(),
        ...(taskId && { taskId }),
        ...(leadId && { leadId }),
      };

      const result = await createReminder(reminderData);

      if (onSuccess) {
        onSuccess(result);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create reminder');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <SlideModal isOpen={isOpen} onClose={onClose} title="Create Reminder">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Reminder Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e =>
              setFormData(prev => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 surface text-primary"
            placeholder="e.g., Follow up with client"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={e =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none surface text-primary"
            rows={3}
            placeholder="Add notes..."
          />
        </div>

        {/* Due Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-subtle" />
              <input
                type="date"
                value={formData.dueDate}
                onChange={e =>
                  setFormData(prev => ({ ...prev, dueDate: e.target.value }))
                }
                className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 surface text-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 w-4 h-4 text-subtle" />
              <input
                type="time"
                value={formData.dueTime}
                onChange={e =>
                  setFormData(prev => ({ ...prev, dueTime: e.target.value }))
                }
                className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 surface text-primary"
              />
            </div>
          </div>
        </div>

        {/* Reminder Timing */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Remind Me
          </label>
          <select
            value={formData.reminderTime}
            onChange={e =>
              setFormData(prev => ({ ...prev, reminderTime: e.target.value }))
            }
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 surface text-primary"
          >
            <option value="on-due-date">On due date</option>
            <option value="before-1-hour">1 hour before</option>
            <option value="before-1-day">1 day before</option>
            <option value="before-3-days">3 days before</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[var(--border)] text-primary rounded-md hover:opacity-70 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Reminder'}
          </button>
        </div>
      </form>
    </SlideModal>
  );
}
