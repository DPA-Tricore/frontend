'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLead } from '@/lib/hooks/use-lead-detail';
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

  const [activeTab, setActiveTab] = useState<Tab>('activity');
  const { data: lead, isLoading, isError } = useLead(id);

  useEffect(() => {
    if (isError) router.push('/leads');
  }, [isError, router]);

  if (isLoading) return <LoadingSpinner message="Loading lead..." />;
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
        leadId={id}
        createdAt={lead.createdAt}
        lastContactedAt={lead.lastContactedAt}
      />

      {/* 2-column layout */}
      <div className="flex gap-6 items-start">
        {/* Left: profile panel */}
        <LeadProfilePanel lead={lead} onEditClick={() => {}} />

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
