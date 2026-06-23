'use client';

import { useState } from 'react';
import { tasksApi } from '@/lib/api/tasks';
import { formatDateTime } from '@/lib/utils/date';
import type { UserResponseDto } from '@/lib/api/users';
import SlideModal from '@/components/slide-modal';
import VoiceRecorder from '@/components/voice-recorder';
import { colors } from '@/lib/theme/colors';

const REMINDER_PRESETS = [
  { label: 'At due time', offset: 0 },
  { label: '15 min before', offset: 15 },
  { label: '30 min before', offset: 30 },
  { label: '1 hour before', offset: 60 },
  { label: '3 hours before', offset: 180 },
  { label: '1 day before', offset: 1440 },
  { label: '2 days before', offset: 2880 },
];

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  users: UserResponseDto[];
  usersLoading: boolean;
}

export default function TaskCreateModal({
  isOpen,
  onClose,
  onCreated,
  users,
  usersLoading,
}: TaskCreateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'CALL',
    priority: 'MEDIUM',
    assignedToId: '',
    dueDate: '',
  });
  const [selectedOffsets, setSelectedOffsets] = useState<number[]>([]);
  const [customReminderTimes, setCustomReminderTimes] = useState<string[]>([]);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFormData({ title: '', description: '', type: 'CALL', priority: 'MEDIUM', assignedToId: '', dueDate: '' });
    setSelectedOffsets([]);
    setCustomReminderTimes([]);
    setCustomTimeInput('');
    setDemoMode(false);
    setVoiceBlob(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleOffset = (offset: number) => {
    setSelectedOffsets((prev) =>
      prev.includes(offset) ? prev.filter((o) => o !== offset) : [...prev, offset],
    );
  };

  const addCustomTime = () => {
    if (customTimeInput && !customReminderTimes.includes(customTimeInput)) {
      setCustomReminderTimes((prev) => [...prev, customTimeInput]);
      setCustomTimeInput('');
    }
  };

  const removeCustomTime = (time: string) => {
    setCustomReminderTimes((prev) => prev.filter((t) => t !== time));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await tasksApi.createTask({
        ...formData,
        dueDate: new Date(formData.dueDate),
        ...(selectedOffsets.length > 0 && { reminderOffsets: selectedOffsets }),
        ...(customReminderTimes.length > 0 && {
          customReminderTimes: customReminderTimes.map((t) => new Date(t).toISOString()),
        }),
        ...(demoMode && { demoMode: true }),
      });
      reset();
      onCreated();
    } catch {
      setError('Failed to create task');
    }
  };

  return (
    <SlideModal isOpen={isOpen} onClose={handleClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="e.g., Follow up with client"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="Task details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            >
              <option value="CALL">Call</option>
              <option value="EMAIL">Email</option>
              <option value="MEETING">Meeting</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Assign To * {usersLoading && <span className="text-xs text-subtle">(Loading...)</span>}
          </label>
          <select
            name="assignedToId"
            value={formData.assignedToId}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Due Date *</label>
          <input
            type="datetime-local"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-3">
            Reminders <span className="text-xs text-subtle font-normal">(optional, select multiple)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {REMINDER_PRESETS.map(({ label, offset }) => {
              const active = selectedOffsets.includes(offset);
              return (
                <button
                  key={offset}
                  type="button"
                  onClick={() => toggleOffset(offset)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-[var(--border)] text-muted hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="datetime-local"
              value={customTimeInput}
              onChange={(e) => setCustomTimeInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            />
            <button
              type="button"
              onClick={addCustomTime}
              disabled={!customTimeInput}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-muted hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Custom
            </button>
          </div>

          {customReminderTimes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {customReminderTimes.map((time) => (
                <span
                  key={time}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white"
                >
                  {formatDateTime(time)}
                  <button type="button" onClick={() => removeCustomTime(time)} className="hover:opacity-70 ml-0.5">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {(selectedOffsets.length > 0 || customReminderTimes.length > 0) && (
            <label className="inline-flex items-center gap-2 mt-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="w-4 h-4 rounded accent-orange-500"
              />
              <span className="text-xs text-orange-600 font-medium">Fire immediately (demo mode)</span>
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Voice Note (Optional)</label>
          <VoiceRecorder
            onVoiceRecorded={(blob) => setVoiceBlob(blob)}
            onVoiceCleared={() => setVoiceBlob(null)}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={handleClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button type="submit" className={colors.button.primary}>
            Create Task
          </button>
        </div>
      </form>
    </SlideModal>
  );
}
