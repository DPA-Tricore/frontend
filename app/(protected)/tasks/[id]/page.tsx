'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { CreateTaskRequest } from '@/lib/types/tasks';
import { useUsers } from '@/lib/hooks/use-users';
import { useTask, useUpdateTask } from '@/lib/hooks/use-task-detail';
import LoadingSpinner from '@/components/loading-spinner';
import TaskTopBar from './components/task-top-bar';
import TaskHero from './components/task-hero';
import TaskRelatedLead from './components/task-related-lead';
import TaskContent from './components/task-description-card';
import TaskPropertiesPanel from './components/task-properties-panel';
import TaskActivityTab from './components/task-activity-tab';
import TaskNotesTab from './components/task-notes-tab';
import TaskDocumentsTab from './components/task-documents-tab';
import TaskRemindersTab from './components/task-reminders-tab';
import TaskEditModal from './components/task-edit-modal';
import TaskCompleteModal from './components/task-complete-modal';
import TaskDeleteDialog from './components/task-delete-dialog';
import { userDisplayName } from '@/lib/utils/user-name';

type Tab = 'activity' | 'notes' | 'documents' | 'reminders';

const TABS: { id: Tab; label: string }[] = [
  { id: 'activity', label: 'Activity' },
  { id: 'notes', label: 'Notes' },
  { id: 'documents', label: 'Documents' },
  { id: 'reminders', label: 'Reminders' },
];

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: task, isLoading, isError } = useTask(id);
  const { data: users = [] } = useUsers();
  const updateTask = useUpdateTask(id);

  const [activeTab, setActiveTab] = useState<Tab>('activity');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (isError) router.push('/tasks');
  }, [isError, router]);

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? userDisplayName(user) : 'Unknown';
  };

  const handleUpdate = (data: Partial<CreateTaskRequest>) => updateTask.mutateAsync(data);

  // Reopening clears completedAt so the task doesn't look done-and-open at once.
  const handleStatusChange = (status: string) =>
    handleUpdate(status === 'COMPLETED' ? { status } : { status, completedAt: null });

  if (isLoading) return <LoadingSpinner message="Loading task..." />;
  if (!task) return null;

  return (
    <div className="min-h-screen">
      <TaskTopBar onBack={() => router.back()} />

      <div className="px-8 py-10 max-w-6xl mx-auto">
        <TaskHero
          task={task}
          getUserName={getUserName}
          updating={updateTask.isPending}
          onStatusChange={handleStatusChange}
          onComplete={() => setShowCompleteModal(true)}
          onEdit={() => setShowEditModal(true)}
          onDelete={() => setShowDeleteDialog(true)}
        />

        {task.lead && (
          <div className="mt-6">
            <TaskRelatedLead lead={task.lead} />
          </div>
        )}

        <div className="border-b border-[var(--border)] my-8" />

        <div className="grid grid-cols-3 gap-10 items-start">
          <div className="col-span-2 min-w-0">
            <TaskContent task={task} />

            <div className="border-b border-[var(--border)] mt-10 mb-6">
              <nav className="flex gap-6">
                {TABS.map(({ id: tabId, label }) => (
                  <button
                    key={tabId}
                    onClick={() => setActiveTab(tabId)}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tabId
                        ? 'border-gray-900 text-primary dark:border-white'
                        : 'border-transparent text-subtle hover:text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {activeTab === 'activity' && <TaskActivityTab task={task} getUserName={getUserName} />}
            {activeTab === 'notes' && <TaskNotesTab taskId={id} />}
            {activeTab === 'documents' && <TaskDocumentsTab taskId={id} />}
            {activeTab === 'reminders' && <TaskRemindersTab taskId={id} />}
          </div>

          <TaskPropertiesPanel
            task={task}
            users={users}
            getUserName={getUserName}
            updating={updateTask.isPending}
            onChange={handleUpdate}
          />
        </div>
      </div>

      <TaskEditModal
        isOpen={showEditModal}
        task={task}
        users={users}
        onClose={() => setShowEditModal(false)}
        onSave={async (data) => {
          await handleUpdate(data);
          setShowEditModal(false);
        }}
      />

      <TaskCompleteModal
        isOpen={showCompleteModal}
        saving={updateTask.isPending}
        onCancel={() => setShowCompleteModal(false)}
        onConfirm={async (data) => {
          await handleUpdate(data);
          setShowCompleteModal(false);
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
