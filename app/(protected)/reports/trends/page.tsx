'use client';

import { useState, useEffect } from 'react';
import { reportsApi } from '@/lib/api/reports';
import type { LeadTrendReport } from '@/lib/types/reports';
import LoadingSpinner from '@/components/loading-spinner';
import DateRangeFilter from '../components/date-range-filter';

export default function LeadTrendPage() {
  const [data, setData] = useState<LeadTrendReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await reportsApi.getLeadTrend({ startDate: startDate || undefined, endDate: endDate || undefined });
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setError('Failed to load lead trend data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [startDate, endDate]);

  const max = Math.max(1, ...(data?.trend.map((p) => p.count) ?? []));

  const formatMonth = (m: string) => {
    const [year, month] = m.split('-');
    return new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <DateRangeFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {data && !loading && (
        <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--surface)]">
          <h2 className="text-sm font-medium text-primary mb-6">New Leads per Month</h2>

          {data.trend.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No data for the selected period.</p>
          ) : (
            <div className="flex items-end gap-3 h-48 overflow-x-auto pb-2">
              {data.trend.map((point) => (
                <div key={point.month} className="flex flex-col items-center gap-1 min-w-[40px]">
                  <span className="text-xs font-medium text-primary">{point.count}</span>
                  <div className="w-full flex items-end" style={{ height: '140px' }}>
                    <div
                      className="w-full bg-gray-900 dark:bg-white rounded-t transition-all duration-500"
                      style={{ height: `${(point.count / max) * 100}%`, minHeight: point.count > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--muted)]">{formatMonth(point.month)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
