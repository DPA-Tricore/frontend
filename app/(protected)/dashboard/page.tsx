'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { leadsApi } from '@/lib/api/leads';
import { colors } from '@/lib/theme/colors';
import { formatMoney } from '@/lib/utils/format';
import {
  type LeadLike,
  toCoverageAmount,
  safeDate,
  monthKey,
  monthLabel,
  getDisplayNameFromEmail,
} from '@/lib/utils/dashboard';
import ReminderWidget from '@/components/reminder-widget';
import DashboardStatCard from './components/dashboard-stat-card';
import DashboardRevenueChart from './components/dashboard-revenue-chart';
import DashboardSaleOverview from './components/dashboard-sale-overview';
import DashboardRecentSales from './components/dashboard-recent-sales';

export default function DashboardPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeadLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await leadsApi.getLeads();
        if (!cancelled) setLeads(Array.isArray(res) ? (res as LeadLike[]) : []);
      } catch {
        if (!cancelled) setError('Failed to load dashboard data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const name = useMemo(() => getDisplayNameFromEmail(user?.email), [user?.email]);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    [],
  );

  const metrics = useMemo(() => {
    const totalLead = leads.length;
    const converted = leads.filter((l) => l.status === 'CONVERTED' || !!l.convertedCustomerId);
    const totalSale = converted.length;
    const totalCustomer = leads.filter((l) => !!l.convertedCustomerId).length;
    const totalRevenue = converted.reduce((sum, l) => sum + toCoverageAmount(l.coverageAmount), 0);

    const now = new Date();
    const monthStarts: Date[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      monthStarts.push(d);
    }

    const map: Record<string, number> = {};
    for (const ms of monthStarts) map[monthKey(ms)] = 0;
    for (const l of converted) {
      const d = safeDate(l.convertedAt) || safeDate(l.createdAt);
      if (d) {
        const key = monthKey(d);
        if (key in map) map[key] += toCoverageAmount(l.coverageAmount);
      }
    }

    const series = monthStarts.map((d) => ({ label: monthLabel(d), value: map[monthKey(d)] || 0 }));
    const prev = series.length >= 2 ? series[series.length - 2].value : 0;
    const curr = series.length >= 1 ? series[series.length - 1].value : 0;
    const deltaPercent = prev > 0 ? ((curr - prev) / prev) * 100 : null;

    return { totalLead, totalSale, totalCustomer, totalRevenue, series, deltaPercent };
  }, [leads]);

  const recentSales = useMemo(
    () =>
      leads
        .filter((l) => l.status === 'CONVERTED' || !!l.convertedCustomerId)
        .slice()
        .sort((a, b) => {
          const da = safeDate(a.convertedAt) || safeDate(a.createdAt) || new Date(0);
          const db = safeDate(b.convertedAt) || safeDate(b.createdAt) || new Date(0);
          return db.getTime() - da.getTime();
        })
        .slice(0, 5),
    [leads],
  );

  const skeleton = <div className="animate-pulse bg-[var(--border)] rounded-lg" />;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 gap-4">
        <div>
          <p className="text-sm text-muted">{dateLabel}</p>
          <h1 className="text-3xl font-bold text-primary mt-1">Welcome back, {name}!</h1>
          <p className="text-muted mt-2">Lead Dashboard</p>
        </div>
        <Link href="/leads" className={colors.button.secondary}>
          Manage Leads
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <DashboardStatCard label="Total Sale" value={loading ? '—' : String(metrics.totalSale)} subLabel="This period" />
        <DashboardStatCard label="Total Lead" value={loading ? '—' : String(metrics.totalLead)} subLabel="All leads" />
        <DashboardStatCard label="Total Revenue" value={loading ? '—' : formatMoney(metrics.totalRevenue)} subLabel="From converted leads" />
        <DashboardStatCard label="Total Customer" value={loading ? '—' : String(metrics.totalCustomer)} subLabel="Converted" />
      </div>

      {/* Charts & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <section className="lg:col-span-2 surface rounded-lg border border-[var(--border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Revenue Insights</h2>
            <div className="text-sm text-muted">Month & year</div>
          </div>
          {loading
            ? <div className="h-52">{skeleton}</div>
            : <DashboardRevenueChart series={metrics.series} />
          }
        </section>

        <div className="flex flex-col gap-6">
          <section className="surface rounded-lg border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-primary">Sale Overview</h2>
            <div className="mt-4">
              {loading
                ? <div className="h-56">{skeleton}</div>
                : <DashboardSaleOverview
                    totalLead={metrics.totalLead}
                    totalSale={metrics.totalSale}
                    totalRevenue={metrics.totalRevenue}
                    deltaPercent={metrics.deltaPercent}
                  />
              }
            </div>
          </section>

          <ReminderWidget limit={3} />
        </div>
      </div>

      {/* Recent sales */}
      <section className="surface rounded-lg border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Recent Sales</h2>
          {!loading && <div className="text-sm text-muted">Latest converted leads</div>}
        </div>
        {loading
          ? <div className="h-72">{skeleton}</div>
          : <DashboardRecentSales sales={recentSales} />
        }
      </section>
    </div>
  );
}
