'use client';

interface Stat {
  label: string;
  value: string | number;
  sub?: string;
}

interface LeadStatsBarProps {
  createdAt: string;
  lastContactedAt?: string | null;
  openTasksCount: number;
  documentsCount: number;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export default function LeadStatsBar({
  createdAt,
  lastContactedAt,
  openTasksCount,
  documentsCount,
}: LeadStatsBarProps) {
  const stats: Stat[] = [
    {
      label: 'Days in pipeline',
      value: daysSince(createdAt),
      sub: 'since created',
    },
    {
      label: 'Last contacted',
      value: lastContactedAt ? `${daysSince(lastContactedAt)}d ago` : '—',
      sub: lastContactedAt ? new Date(lastContactedAt).toLocaleDateString() : 'never',
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
          <p className="text-2xl font-semibold text-primary">{stat.value}</p>
          {stat.sub && <p className="text-xs text-subtle mt-0.5">{stat.sub}</p>}
        </div>
      ))}
    </div>
  );
}
