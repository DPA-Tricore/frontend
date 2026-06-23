'use client';

import { useState, useEffect } from 'react';
import { reportsApi } from '@/lib/api/reports';
import type { PipelineReport } from '@/lib/types/reports';
import { getStatusColor } from '@/lib/theme/colors';
import LoadingSpinner from '@/components/loading-spinner';
import DateRangeFilter from '../components/date-range-filter';

const STATUS_ORDER = ['NEW', 'CONTACTED', 'QUALIFIED', 'IN_NEGOTIATION', 'CONVERTED', 'LOST', 'UNRESPONSIVE'];

export default function PipelineReportPage() {
  const [data, setData] = useState<PipelineReport | null>(null);
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
        const res = await reportsApi.getPipeline({ startDate: startDate || undefined, endDate: endDate || undefined });
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setError('Failed to load pipeline report.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [startDate, endDate]);

  const sorted = data
    ? [...data.stages].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
    : [];

  const max = Math.max(1, ...sorted.map((s) => s.count));

  return (
    <div className="space-y-6">
      <DateRangeFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {data && !loading && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Leads', value: data.total },
              { label: 'Converted', value: data.convertedCount },
              { label: 'Lost', value: data.lostCount },
              { label: 'Conversion Rate', value: `${data.conversionRate}%` },
            ].map(({ label, value }) => (
              <div key={label} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)]">
                <p className="text-xs text-[var(--muted)] mb-1">{label}</p>
                <p className="text-2xl font-semibold text-primary">{value}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--surface)]">
            <h2 className="text-sm font-medium text-primary mb-6">Leads by Stage</h2>
            <div className="space-y-4">
              {sorted.map((stage) => (
                <div key={stage.status} className="flex items-center gap-4">
                  <span className="w-32 text-xs text-[var(--muted)] shrink-0">{stage.status.replace('_', ' ')}</span>
                  <div className="flex-1 bg-[var(--bg)] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gray-900 dark:bg-white transition-all duration-500"
                      style={{ width: `${(stage.count / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-primary">{stage.count}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(stage.status)}`}>
                    {stage.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
