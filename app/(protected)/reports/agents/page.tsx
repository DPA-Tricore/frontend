'use client';

import { useState, useEffect } from 'react';
import { reportsApi } from '@/lib/api/reports';
import type { AgentPerformanceReport, AgentMetrics } from '@/lib/types/reports';
import LoadingSpinner from '@/components/loading-spinner';
import DateRangeFilter from '../components/date-range-filter';
import ExportButton from '../components/export-button';

type SortKey = keyof Pick<AgentMetrics, 'totalLeads' | 'convertedLeads' | 'lostLeads' | 'conversionRate' | 'tasksCompleted'>;

export default function AgentPerformancePage() {
  const [data, setData] = useState<AgentPerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('totalLeads');
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await reportsApi.getAgentPerformance({ startDate: startDate || undefined, endDate: endDate || undefined });
        if (!cancelled) setData(res);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.status === 403 ? 'You do not have permission to view agent performance.' : 'Failed to load agent performance.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [startDate, endDate]);

  const sorted = data
    ? [...data.agents].sort((a, b) => sortDesc ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey])
    : [];

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc(!sortDesc);
    else { setSortKey(key); setSortDesc(true); }
  };

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="px-4 py-3 font-medium text-right cursor-pointer select-none hover:text-primary"
      onClick={() => toggleSort(k)}
    >
      {label} {sortKey === k ? (sortDesc ? '↓' : '↑') : ''}
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <DateRangeFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
        <ExportButton type="agent-performance" query={{ startDate: startDate || undefined, endDate: endDate || undefined }} />
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {data && !loading && (
        <div className="border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted)]">
                <th className="px-4 py-3 font-medium">Agent</th>
                <SortHeader label="Total Leads" k="totalLeads" />
                <SortHeader label="Converted" k="convertedLeads" />
                <SortHeader label="Lost" k="lostLeads" />
                <SortHeader label="Conv. Rate" k="conversionRate" />
                <SortHeader label="Tasks Done" k="tasksCompleted" />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)] text-sm">
                    No agents found.
                  </td>
                </tr>
              ) : (
                sorted.map((agent) => (
                  <tr key={agent.agentId} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors">
                    <td className="px-4 py-3 text-primary font-medium">{agent.agentEmail}</td>
                    <td className="px-4 py-3 text-right text-primary">{agent.totalLeads}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{agent.convertedLeads}</td>
                    <td className="px-4 py-3 text-right text-red-500">{agent.lostLeads}</td>
                    <td className="px-4 py-3 text-right font-medium text-primary">{agent.conversionRate}%</td>
                    <td className="px-4 py-3 text-right text-primary">{agent.tasksCompleted}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
