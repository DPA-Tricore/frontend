'use client';

import { useState, useEffect } from 'react';
import { reportsApi } from '@/lib/api/reports';
import type { ActivityReport } from '@/lib/types/reports';
import { getTaskTypeColor } from '@/lib/theme/colors';
import LoadingSpinner from '@/components/loading-spinner';
import DateRangeFilter from '../components/date-range-filter';

export default function ActivityReportPage() {
  const [data, setData] = useState<ActivityReport | null>(null);
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
        const res = await reportsApi.getActivity({ startDate: startDate || undefined, endDate: endDate || undefined });
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setError('Failed to load activity report.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      <DateRangeFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {data && !loading && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Completed', value: data.totalCompleted },
              { label: 'Pending', value: data.totalPending },
              { label: 'Overdue', value: data.totalOverdue },
            ].map(({ label, value }) => (
              <div key={label} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)]">
                <p className="text-xs text-[var(--muted)] mb-1">{label}</p>
                <p className="text-2xl font-semibold text-primary">{value}</p>
              </div>
            ))}
          </div>

          {/* Task type breakdown table */}
          <div className="border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted)]">
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-right">Completed</th>
                  <th className="px-4 py-3 font-medium text-right">Pending</th>
                  <th className="px-4 py-3 font-medium text-right">Cancelled</th>
                </tr>
              </thead>
              <tbody>
                {data.byType.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)] text-sm">
                      No tasks found for the selected period.
                    </td>
                  </tr>
                ) : (
                  data.byType.map((row) => (
                    <tr key={row.type} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTaskTypeColor(row.type)}`}>
                          {row.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-primary">{row.total}</td>
                      <td className="px-4 py-3 text-right text-emerald-600">{row.completed}</td>
                      <td className="px-4 py-3 text-right text-yellow-600">{row.pending}</td>
                      <td className="px-4 py-3 text-right text-[var(--muted)]">{row.cancelled}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
