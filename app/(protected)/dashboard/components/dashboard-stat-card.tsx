interface DashboardStatCardProps {
  label: string;
  value: string;
  subLabel?: string;
}

export default function DashboardStatCard({ label, value, subLabel }: DashboardStatCardProps) {
  return (
    <div className="surface rounded-lg border border-[var(--border)] p-5">
      <div className="text-sm text-muted font-medium">{label}</div>
      <div className="mt-2 text-2xl font-bold text-primary">{value}</div>
      {subLabel && <div className="mt-1 text-sm text-emerald-600">{subLabel}</div>}
    </div>
  );
}
