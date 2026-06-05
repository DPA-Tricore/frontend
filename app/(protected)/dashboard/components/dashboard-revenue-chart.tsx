import { formatMoney } from '@/lib/utils/format';

interface DashboardRevenueChartProps {
  series: Array<{ label: string; value: number }>;
}

export default function DashboardRevenueChart({ series }: DashboardRevenueChartProps) {
  const max = Math.max(0, ...series.map((s) => s.value));

  return (
    <div>
      <div className="h-52 flex items-end gap-3">
        {series.map((s) => {
          const h = max > 0 ? Math.round((s.value / max) * 100) : 0;
          return (
            <div key={s.label} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gray-900/90 dark:bg-gray-100/90 rounded-t-lg"
                style={{ height: `${h}%`, minHeight: h === 0 ? 6 : undefined }}
              />
              <div className="mt-3 text-xs text-muted text-center">{s.label}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm text-muted">Revenue insight</div>
        <div className="text-sm font-medium text-primary">Peak: {formatMoney(max)}</div>
      </div>
    </div>
  );
}
