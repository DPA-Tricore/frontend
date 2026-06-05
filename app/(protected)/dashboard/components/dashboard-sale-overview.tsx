import { formatMoney } from '@/lib/utils/format';

interface DashboardSaleOverviewProps {
  totalLead: number;
  totalSale: number;
  totalRevenue: number;
  deltaPercent: number | null;
}

export default function DashboardSaleOverview({
  totalLead,
  totalSale,
  totalRevenue,
  deltaPercent,
}: DashboardSaleOverviewProps) {
  const p = totalLead > 0 ? totalSale / totalLead : 0;
  const percent = Math.round(p * 100);
  const radius = 90;
  const arcLength = Math.PI * radius;
  const dash1 = arcLength * p;
  const dash2 = Math.max(0, arcLength - dash1);

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted font-medium">Sales Growth</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">
              {deltaPercent === null ? '—' : `${deltaPercent > 0 ? '+' : ''}${deltaPercent.toFixed(1)}%`}
            </div>
            {deltaPercent !== null && (
              <div className={`text-sm font-medium ${deltaPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {deltaPercent >= 0 ? 'Up' : 'Down'}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted font-medium">Total Revenue</div>
          <div className="mt-1 text-lg font-bold text-primary">{formatMoney(totalRevenue)}</div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6">
        <div className="relative w-56 max-w-[220px] mx-auto">
          <svg viewBox="0 0 220 120" className="w-full">
            <path
              d="M20 110 A90 90 0 0 1 200 110"
              stroke="rgb(229 231 235)"
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M20 110 A90 90 0 0 1 200 110"
              stroke="rgb(17 24 39)"
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${dash1} ${dash2}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="-mt-3 text-center">
              <div className="text-2xl font-bold text-primary">{percent}%</div>
              <div className="text-xs text-muted">Converted</div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">Sales</div>
            <div className="text-sm font-semibold text-primary">{totalSale}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">Leads</div>
            <div className="text-sm font-semibold text-primary">{totalLead}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">Refunds</div>
            <div className="text-sm font-semibold text-primary">0</div>
          </div>
        </div>
      </div>
    </div>
  );
}
