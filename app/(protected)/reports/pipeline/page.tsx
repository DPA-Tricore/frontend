'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { reportsApi } from '@/lib/api/reports';
import type { PipelineReport } from '@/lib/types/reports';
import LoadingSpinner from '@/components/loading-spinner';
import DateRangeFilter from '../components/date-range-filter';
import ExportButton from '../components/export-button';

const STATUS_ORDER = ['NEW', 'CONTACTED', 'QUALIFIED', 'IN_NEGOTIATION', 'CONVERTED', 'LOST', 'UNRESPONSIVE'];

const STATUS_COLORS: Record<string, string> = {
  NEW: '#6366f1',
  CONTACTED: '#3b82f6',
  QUALIFIED: '#f59e0b',
  IN_NEGOTIATION: '#8b5cf6',
  CONVERTED: '#10b981',
  LOST: '#ef4444',
  UNRESPONSIVE: '#9ca3af',
};

const formatLabel = (s: string) =>
  s
    .split('_')
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(' ');

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { status, count, pct } = payload[0].payload;
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-primary">{formatLabel(status)}</p>
      <p className="text-[var(--muted)]">
        {count} leads · {pct}%
      </p>
    </div>
  );
};

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

  const chartData = data
    ? [...data.stages]
        .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
        .map((s) => ({
          ...s,
          name: formatLabel(s.status),
          pct: data.total > 0 ? ((s.count / data.total) * 100).toFixed(1) : '0.0',
        }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <DateRangeFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
        <ExportButton type="pipeline" query={{ startDate: startDate || undefined, endDate: endDate || undefined }} />
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {data && !loading && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Leads', value: data.total },
              { label: 'Converted', value: data.convertedCount, valueClass: 'text-emerald-600' },
              { label: 'Lost', value: data.lostCount, valueClass: 'text-red-500' },
              { label: 'Conversion Rate', value: `${data.conversionRate}%`, valueClass: 'text-primary' },
            ].map(({ label, value, valueClass }) => (
              <div key={label} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)]">
                <p className="text-xs text-[var(--muted)] mb-1">{label}</p>
                <p className={`text-2xl font-semibold ${valueClass ?? 'text-primary'}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--surface)]">
            <h2 className="text-sm font-medium text-primary mb-6">Leads by Stage</h2>
            {chartData.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-4">No leads found for the selected period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={chartData.length * 52}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 48, left: 16, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 12, fill: 'var(--muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg)', opacity: 0.5 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {chartData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
