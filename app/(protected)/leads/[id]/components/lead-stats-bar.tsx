'use client';

import { useLeadTasks, useLeadDocuments } from '@/lib/hooks/use-lead-detail';

interface Stat {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

const STALE_CONTACT_DAYS = 14;

interface LeadStatsBarProps {
  leadId: string;
  createdAt: string;
  lastContactedAt?: string | null;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export default function LeadStatsBar({ leadId, createdAt, lastContactedAt }: LeadStatsBarProps) {
  const { data: tasks } = useLeadTasks(leadId);
  const { data: documents } = useLeadDocuments(leadId);
  const openTasksCount = (tasks ?? []).filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED',
  ).length;
  const documentsCount = (documents ?? []).length;
  const daysSinceContact = lastContactedAt ? daysSince(lastContactedAt) : null;
  const contactStale = daysSinceContact === null || daysSinceContact > STALE_CONTACT_DAYS;

  const stats: Stat[] = [
    {
      label: 'Days in pipeline',
      value: daysSince(createdAt),
      sub: 'since created',
    },
    {
      label: 'Last contacted',
      value: lastContactedAt ? `${daysSinceContact}d ago` : '—',
      sub: lastContactedAt ? new Date(lastContactedAt).toLocaleDateString() : 'never contacted',
      accent: contactStale,
    },
    {
      label: 'Open tasks',
      value: openTasksCount,
      sub: openTasksCount === 1 ? 'task pending' : 'tasks pending',
    },
    {
      label: 'Documents',
      value: documentsCount,
      sub: documentsCount === 1 ? 'file attached' : 'files attached',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="surface border border-[var(--border)] rounded-xl px-5 py-4">
          <p className="text-xs text-subtle mb-1">{stat.label}</p>
          <p className={`text-2xl font-semibold ${stat.accent ? 'text-red-600 dark:text-red-400' : 'text-primary'}`}>
            {stat.value}
          </p>
          {stat.sub && <p className="text-xs text-subtle mt-0.5">{stat.sub}</p>}
        </div>
      ))}
    </div>
  );
}
