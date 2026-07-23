'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { leadsApi, LeadResponseDto } from '@/lib/api/leads';
import { tasksApi } from '@/lib/api/tasks';
import { documentsApi } from '@/lib/api/documents';
import LoadingSpinner from '@/components/loading-spinner';
import LeadProfilePanel from './components/lead-profile-panel';
import LeadStatsBar from './components/lead-stats-bar';
import LeadActivityTab from './components/lead-activity-tab';
import LeadTasksTab from './components/lead-tasks-tab';
import LeadRemindersTab from './components/lead-reminders-tab';
import LeadDocumentsTab from './components/lead-documents-tab';

type Tab = 'activity' | 'tasks' | 'reminders' | 'documents';

const TABS: { id: Tab; label: string }[] = [
  { id: 'activity', label: 'Activity' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'documents', label: 'Documents' },
];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lead, setLead] = useState<LeadResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('activity');
  const [openTasksCount, setOpenTasksCount] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);

  const fetchLead = useCallback(async () => {
    try {
      const data = await leadsApi.getLead(id);
      setLead(data);
    } catch {
      router.push('/leads');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchLead();
    // Fetch counts for stats bar
    tasksApi.getTasksByLeadId(id)
      .then((tasks) => setOpenTasksCount(tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length))
      .catch(() => {});
    documentsApi.getLeadDocuments(id)
      .then((docs) => setDocumentsCount(docs.length))
      .catch(() => {});
  }, [id, fetchLead]);

  if (loading) return <LoadingSpinner message="Loading lead..." />;
  if (!lead) return null;

  return (
    <div className="p-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="text-sm text-subtle hover:text-primary transition-colors mb-6 flex items-center gap-1"
      >
        ← Back to Leads
      </button>

      {/* Stats bar */}
      <LeadStatsBar
        createdAt={lead.createdAt}
        lastContactedAt={lead.lastContactedAt}
        openTasksCount={openTasksCount}
        documentsCount={documentsCount}
      />

      {/* 2-column layout */}
      <div className="flex gap-6 items-start">
        {/* Left: profile panel */}
        <LeadProfilePanel
          lead={lead}
          onStatusChange={(newStatus) => setLead((prev) => prev ? { ...prev, status: newStatus } : prev)}
          onAssigneeChange={(agentId) => setLead((prev) => prev ? { ...prev, assignedAgentId: agentId ?? undefined } : prev)}
          onEditClick={() => {}}
        />

        {/* Right: tabs */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="border-b border-[var(--border)] mb-6">
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

          {/* Tab content */}
          {activeTab === 'activity' && <LeadActivityTab leadId={id} />}
          {activeTab === 'tasks' && <LeadTasksTab leadId={id} />}
          {activeTab === 'reminders' && <LeadRemindersTab leadId={id} />}
          {activeTab === 'documents' && <LeadDocumentsTab leadId={id} />}
        </div>
      </div>
    </div>
  );
}
