'use client';

import { useState, useEffect } from 'react';
import type { CreateTaskRequest, TaskResponseDto } from '@/lib/types/tasks';
import type { UserResponseDto } from '@/lib/api/users';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';
import { userDisplayName } from '@/lib/utils/user-name';

interface TaskEditModalProps {
  isOpen: boolean;
  task: TaskResponseDto;
  users: UserResponseDto[];
  onClose: () => void;
  onSave: (data: Partial<CreateTaskRequest>) => Promise<unknown>;
}

function toDatetimeLocal(date: Date | string | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export default function TaskEditModal({ isOpen, task, users, onClose, onSave }: TaskEditModalProps) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description ?? '',
    type: task.type,
    priority: task.priority,
    assignedToId: task.assignedToId,
    dueDate: toDatetimeLocal(task.dueDate),
    startDate: toDatetimeLocal(task.startDate),
    outcome: task.outcome ?? '',
    resultType: task.resultType ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description ?? '',
      type: task.type,
      priority: task.priority,
      assignedToId: task.assignedToId,
      dueDate: toDatetimeLocal(task.dueDate),
      startDate: toDatetimeLocal(task.startDate),
      outcome: task.outcome ?? '',
      resultType: task.resultType ?? '',
    });
    setError(null);
  }, [task]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave({
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        priority: formData.priority,
        assignedToId: formData.assignedToId,
        dueDate: new Date(formData.dueDate),
        ...(formData.startDate && { startDate: new Date(formData.startDate) }),
        ...(formData.outcome && { outcome: formData.outcome }),
        ...(formData.resultType && { resultType: formData.resultType }),
      });
    } catch {
      setError('Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary text-sm';

  return (
    <SlideModal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Type *</label>
            <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
              <option value="CALL">Call</option>
              <option value="EMAIL">Email</option>
              <option value="MEETING">Meeting</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className={inputClass}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Result Type</label>
          <select name="resultType" value={formData.resultType} onChange={handleChange} className={inputClass}>
            <option value="">None</option>
            <option value="SUCCESS">Success</option>
            <option value="NO_ANSWER">No Answer</option>
            <option value="RESCHEDULED">Rescheduled</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Assign To *</label>
          <select
            name="assignedToId"
            value={formData.assignedToId}
            onChange={handleChange}
            required
            className={inputClass}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {userDisplayName(user)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Due Date *</label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Start Date</label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Outcome Notes</label>
          <textarea
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            rows={3}
            placeholder="Describe the outcome…"
            className={inputClass}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`${colors.button.primary} disabled:opacity-50`}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </SlideModal>
  );
}
