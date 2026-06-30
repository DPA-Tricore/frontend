'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tasksApi } from '@/lib/api/tasks';
import { usersApi, UserResponseDto } from '@/lib/api/users';
import type { TaskResponseDto } from '@/lib/types/tasks';
import LoadingSpinner from '@/components/loading-spinner';
import TaskTopBar from './components/task-top-bar';
import TaskHero from './components/task-hero';
import TaskContent from './components/task-description-card';
import TaskPropertiesPanel from './components/task-properties-panel';
import TaskEditModal from './components/task-edit-modal';
import TaskDeleteDialog from './components/task-delete-dialog';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [task, setTask] = useState<TaskResponseDto | null>(null);
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [completing, setCompleting] = useState(false);

  const fetchTask = useCallback(async () => {
    try {
      const data = await tasksApi.getTask(id);
      setTask(data);
    } catch {
      router.push('/tasks');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchTask();
    usersApi.getUsers().then(setUsers).catch(() => {});
  }, [fetchTask]);

  const getUserEmail = (userId: string) =>
    users.find((u) => u.id === userId)?.email ?? 'Unknown';

  const handleMarkComplete = async () => {
    if (!task || task.status === 'COMPLETED') return;
    setCompleting(true);
    try {
      const updated = await tasksApi.updateTask(task.id, {
        status: 'COMPLETED',
        completedAt: new Date(),
      });
      setTask(updated);
    } finally {
      setCompleting(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!task) return;
    const updated = await tasksApi.updateTask(task.id, { status });
    setTask(updated);
  };

  if (loading) return <LoadingSpinner message="Loading task..." />;
  if (!task) return null;

  return (
    <div className="min-h-screen">
      <TaskTopBar onBack={() => router.back()} />

      <div className="px-8 py-10 max-w-6xl mx-auto">
        <TaskHero
          task={task}
          getUserEmail={getUserEmail}
          completing={completing}
          onStatusChange={handleStatusChange}
          onMarkComplete={handleMarkComplete}
          onEdit={() => setShowEditModal(true)}
          onDelete={() => setShowDeleteDialog(true)}
        />

        <div className="border-b border-[var(--border)] my-8" />

        <div className="grid grid-cols-3 gap-10 items-start">
          <div className="col-span-2">
            <TaskContent task={task} />
          </div>
          <TaskPropertiesPanel task={task} getUserEmail={getUserEmail} />
        </div>
      </div>

      <TaskEditModal
        isOpen={showEditModal}
        task={task}
        users={users}
        onClose={() => setShowEditModal(false)}
        onUpdated={(updated) => {
          setTask(updated);
          setShowEditModal(false);
        }}
      />

      <TaskDeleteDialog
        isOpen={showDeleteDialog}
        task={task}
        onCancel={() => setShowDeleteDialog(false)}
        onDeleted={() => router.push('/tasks')}
      />
    </div>
  );
}
