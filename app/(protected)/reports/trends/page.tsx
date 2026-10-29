'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
} from 'recharts';
import { reportsApi } from '@/lib/api/reports';
import type { LeadTrendReport } from '@/lib/types/reports';
import LoadingSpinner from '@/components/loading-spinner';
import DateRangeFilter from '../components/date-range-filter';
import ExportButton from '../components/export-button';

const formatMonth = (m: string) => {
  const [year, month] = m.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
};

const CustomTooltip = ({ active, payload, label }: Partial<TooltipContentProps<number, string>>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="text-[var(--muted)] mb-1">{label}</p>
      <p className="font-semibold text-primary">{payload[0].value} leads</p>
    </div>
  );
};

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

  const chartData = data?.trend.map((p) => ({ ...p, label: formatMonth(p.month) })) ?? [];

  const total = chartData.reduce((sum, p) => sum + p.count, 0);
  const peak = chartData.reduce((best, p) => (p.count > best.count ? p : best), { count: 0, label: '—' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <DateRangeFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
        <ExportButton type="lead-trend" query={{ startDate: startDate || undefined, endDate: endDate || undefined }} />
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {data && !loading && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)]">
              <p className="text-xs text-[var(--muted)] mb-1">Total Leads</p>
              <p className="text-2xl font-semibold text-primary">{total}</p>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)]">
              <p className="text-xs text-[var(--muted)] mb-1">Peak Month</p>
              <p className="text-2xl font-semibold text-primary">{peak.label}</p>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)]">
              <p className="text-xs text-[var(--muted)] mb-1">Peak Count</p>
              <p className="text-2xl font-semibold text-primary">{peak.count > 0 ? peak.count : '—'}</p>
            </div>
          </div>

          <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--surface)]">
            <h2 className="text-sm font-medium text-primary mb-6">New Leads per Month</h2>

            {chartData.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No data for the selected period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: 'var(--muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: 'var(--muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#leadFill)"
                    dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
