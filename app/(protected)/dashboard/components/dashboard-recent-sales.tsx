import { getStatusColor } from '@/lib/theme/colors';
import { formatMoney } from '@/lib/utils/format';
import { safeDate, toCoverageAmount, type LeadLike } from '@/lib/utils/dashboard';

interface DashboardRecentSalesProps {
  sales: LeadLike[];
}

export default function DashboardRecentSales({ sales }: DashboardRecentSalesProps) {
  if (sales.length === 0) {
    return <div className="text-center py-10 text-muted">No converted leads yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)] [background:var(--bg)]">
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Order Id</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Date</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Customer</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Category</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Items</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((l) => {
            const d = safeDate(l.convertedAt) || safeDate(l.createdAt);
            const statusLabel = l.status === 'CONVERTED' ? 'Completed' : l.status;
            const total = toCoverageAmount(l.coverageAmount);

            return (
              <tr key={l.id} className="border-b border-[var(--border)] hover:[background:var(--bg)]">
                <td className="px-4 py-4 text-sm text-muted">{l.id.slice(0, 6).toUpperCase()}</td>
                <td className="px-4 py-4 text-sm text-muted">{d ? d.toLocaleDateString() : '—'}</td>
                <td className="px-4 py-4 text-sm font-medium text-primary">
                  {l.firstName} {l.lastName}
                </td>
                <td className="px-4 py-4 text-sm text-muted">{l.leadType}</td>
                <td className="px-4 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(l.status)}`}>
                    {statusLabel}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-muted">1 item</td>
                <td className="px-4 py-4 text-sm font-semibold text-primary">{formatMoney(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
