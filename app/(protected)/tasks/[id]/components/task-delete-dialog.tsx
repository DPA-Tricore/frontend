'use client';

import { useState } from 'react';
import { tasksApi } from '@/lib/api/tasks';
import type { TaskResponseDto } from '@/lib/types/tasks';

interface TaskDeleteDialogProps {
  isOpen: boolean;
  task: TaskResponseDto;
  onCancel: () => void;
  onDeleted: () => void;
}

export default function TaskDeleteDialog({ isOpen, task, onCancel, onDeleted }: TaskDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tasksApi.deleteTask(task.id);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="surface border border-[var(--border)] rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-base font-semibold text-primary mb-2">Delete Task</h3>
        <p className="text-sm text-subtle mb-6">
          Are you sure you want to delete{' '}
          <span className="font-medium text-primary">&ldquo;{task.title}&rdquo;</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2 text-sm border border-[var(--border)] rounded-lg text-primary hover:opacity-70 transition-opacity disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
