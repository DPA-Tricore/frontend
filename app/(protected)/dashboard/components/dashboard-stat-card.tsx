import { type LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
  label: string;
  value: string;
  subLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
}

export default function DashboardStatCard({
  label,
  value,
  subLabel,
  icon: Icon,
  iconColor = 'text-blue-500',
}: DashboardStatCardProps) {
  return (
    <div className="surface rounded-lg border border-[var(--border)] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon && (
          <div className={`p-1.5 rounded-md bg-[var(--surface-2)] ${iconColor}`}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-primary">{value}</p>
      {subLabel && <p className="mt-1 text-xs text-muted">{subLabel}</p>}
    </div>
  );
}
