import type { TaskResponseDto } from '@/lib/types/tasks';

interface Stat {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

function daysUntil(date: Date | string): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
}

function daysSince(date: Date | string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

function formatDueLabel(task: TaskResponseDto): { value: string; sub: string; accent: boolean } {
  if (task.status === 'COMPLETED') return { value: 'Done', sub: 'completed', accent: false };
  if (task.status === 'CANCELLED') return { value: 'Cancelled', sub: 'no longer active', accent: false };
  const days = daysUntil(task.dueDate);
  if (days < 0) return { value: `${Math.abs(days)}d`, sub: 'overdue', accent: true };
  if (days === 0) return { value: 'Today', sub: 'due today', accent: true };
  return { value: `${days}d`, sub: 'until due', accent: false };
}

interface TaskStatsBarProps {
  task: TaskResponseDto;
}

export default function TaskStatsBar({ task }: TaskStatsBarProps) {
  const due = formatDueLabel(task);

  const stats: Stat[] = [
    {
      label: 'Due in',
      value: due.value,
      sub: due.sub,
      accent: due.accent,
    },
    {
      label: 'Created',
      value: `${daysSince(task.createdAt)}d ago`,
      sub: new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      label: 'Last updated',
      value: `${daysSince(task.updatedAt)}d ago`,
      sub: new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      label: 'Priority',
      value: task.priority,
      sub: task.type.replace(/_/g, ' ').toLowerCase(),
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="surface border border-[var(--border)] rounded-xl px-5 py-4">
          <p className="text-xs text-subtle mb-1">{stat.label}</p>
          <p className={`text-2xl font-semibold ${stat.accent ? 'text-red-600' : 'text-primary'}`}>
            {stat.value}
          </p>
          {stat.sub && <p className="text-xs text-subtle mt-0.5">{stat.sub}</p>}
        </div>
      ))}
    </div>
  );
}
