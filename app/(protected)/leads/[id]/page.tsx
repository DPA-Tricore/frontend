'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLead } from '@/lib/hooks/use-lead-detail';
import LoadingSpinner from '@/components/loading-spinner';
import LeadTopBar from './components/lead-top-bar';
import LeadHero from './components/lead-hero';
import LeadNextAction from './components/lead-next-action';
import LeadStatsBar from './components/lead-stats-bar';
import LeadPropertiesPanel from './components/lead-properties-panel';
import LeadActivityTab from './components/lead-activity-tab';
import LeadTasksTab from './components/lead-tasks-tab';
import LeadRemindersTab from './components/lead-reminders-tab';
import LeadDocumentsTab from './components/lead-documents-tab';
import LeadNotesTab from './components/lead-notes-tab';

type Tab = 'activity' | 'tasks' | 'reminders' | 'documents' | 'notes';

const TABS: { id: Tab; label: string }[] = [
  { id: 'activity', label: 'Activity' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'documents', label: 'Documents' },
  { id: 'notes', label: 'Notes' },
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
    <div className="min-h-screen">
      <LeadTopBar onBack={() => router.back()} />

      <div className="px-8 py-10 max-w-6xl mx-auto">
        <LeadHero lead={lead} onEditClick={() => {}} />

        <div className="mt-6">
          <LeadNextAction leadId={id} onJump={setActiveTab} />
          <LeadStatsBar leadId={id} createdAt={lead.createdAt} lastContactedAt={lead.lastContactedAt} />
        </div>

        <div className="border-b border-[var(--border)] my-8" />

        <div className="grid grid-cols-3 gap-10 items-start">
          <div className="col-span-2 min-w-0">
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
            {activeTab === 'notes' && <LeadNotesTab leadId={id} />}
          </div>

          <LeadPropertiesPanel lead={lead} />
        </div>
      </div>
    </div>
  );
}
