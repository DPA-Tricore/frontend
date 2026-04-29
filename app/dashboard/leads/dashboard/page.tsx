'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { leadsApi, LeadResponseDto } from '@/lib/api/leads';
import { colors, getStatusColor } from '@/lib/theme/colors';

type LeadLike = Omit<LeadResponseDto, 'createdAt'> & {
  createdAt: string | Date;
  convertedAt?: string | Date | null;
  coverageAmount?: unknown;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function toCoverageAmount(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === 'object' && value && 'toNumber' in value) {
    // Prisma Decimal implements toNumber()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const n = (value as any).toNumber?.();
    return typeof n === 'number' && Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function safeDate(value?: string | Date | null) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`; // 1-12
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
}

function getDisplayNameFromEmail(email?: string | null) {
  if (!email) return 'User';
  const raw = email.split('@')[0] || 'User';
  return raw
    .split(/[\W_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function StatCard({
  label,
  value,
  subLabel,
}: {
  label: string;
  value: string;
  subLabel?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="text-sm text-gray-600 font-medium">{label}</div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
      {subLabel ? <div className="mt-1 text-sm text-emerald-600">{subLabel}</div> : null}
    </div>
  );
}

function RevenueInsightChart({
  series,
}: {
  series: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(0, ...series.map((s) => s.value));
  return (
    <div>
      <div className="h-52 flex items-end gap-3">
        {series.map((s) => {
          const h = max > 0 ? Math.round((s.value / max) * 100) : 0;
          return (
            <div key={s.label} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gray-900/90 rounded-t-lg"
                style={{ height: `${h}%`, minHeight: h === 0 ? 6 : undefined }}
              />
              <div className="mt-3 text-xs text-gray-500 text-center">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm text-gray-600">Revenue insight</div>
        <div className="text-sm font-medium text-gray-900">Peak: {formatMoney(max)}</div>
      </div>
    </div>
  );
}

function SaleOverview({
  totalLead,
  totalSale,
  totalRevenue,
  deltaPercent,
}: {
  totalLead: number;
  totalSale: number;
  totalRevenue: number;
  deltaPercent: number | null;
}) {
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
          <div className="text-sm text-gray-600 font-medium">Sales Growth</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-2xl font-bold text-gray-900">
              {deltaPercent === null ? '—' : `${deltaPercent > 0 ? '+' : ''}${deltaPercent.toFixed(1)}%`}
            </div>
            {deltaPercent === null ? null : (
              <div
                className={`text-sm font-medium ${
                  deltaPercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {deltaPercent >= 0 ? 'Up' : 'Down'}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 font-medium">Total Revenue</div>
          <div className="mt-1 text-lg font-bold text-gray-900">{formatMoney(totalRevenue)}</div>
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
            <div className="-mt-3">
              <div className="text-2xl font-bold text-gray-900">{percent}%</div>
              <div className="text-xs text-gray-500 text-center">Converted</div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Sales</div>
            <div className="text-sm font-semibold text-gray-900">{totalSale}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Leads</div>
            <div className="text-sm font-semibold text-gray-900">{totalLead}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Refunds</div>
            <div className="text-sm font-semibold text-gray-900">0</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadDashboardPage() {
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
        const list = Array.isArray(res) ? (res as LeadLike[]) : [];
        if (!cancelled) setLeads(list);
      } catch (e) {
        if (!cancelled) setError('Failed to load dashboard data');
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const name = useMemo(() => getDisplayNameFromEmail(user?.email), [user?.email]);
  const dateLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date());
  }, []);

  const metrics = useMemo(() => {
    const totalLead = leads.length;
    const converted = leads.filter((l) => l.status === 'CONVERTED' || !!l.convertedCustomerId);
    const totalSale = converted.length;
    const totalCustomer = leads.filter((l) => !!l.convertedCustomerId).length;

    const totalRevenue = converted.reduce((sum, l) => {
      return sum + toCoverageAmount(l.coverageAmount);
    }, 0);

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
      if (!d) continue;
      const key = monthKey(d);
      if (key in map) {
        map[key] += toCoverageAmount(l.coverageAmount);
      }
    }

    const series = monthStarts.map((d) => ({
      label: monthLabel(d),
      value: map[monthKey(d)] || 0,
    }));

    const prev = series.length >= 2 ? series[series.length - 2].value : 0;
    const curr = series.length >= 1 ? series[series.length - 1].value : 0;
    const deltaPercent = prev > 0 ? ((curr - prev) / prev) * 100 : null;

    return { totalLead, totalSale, totalCustomer, totalRevenue, series, deltaPercent };
  }, [leads]);

  const recentSales = useMemo(() => {
    return leads
      .filter((l) => l.status === 'CONVERTED' || !!l.convertedCustomerId)
      .slice()
      .sort((a, b) => {
        const da = safeDate(a.convertedAt) || safeDate(a.createdAt) || new Date(0);
        const db = safeDate(b.convertedAt) || safeDate(b.createdAt) || new Date(0);
        return db.getTime() - da.getTime();
      })
      .slice(0, 5);
  }, [leads]);

  return (
    <div className="p-8">
      {/* Welcome header */}
      <div className="flex justify-between items-start mb-8 gap-4">
        <div>
          <p className="text-sm text-gray-500">{dateLabel}</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Welcome back, {name}!</h1>
          <p className="text-gray-600 mt-2">Lead Dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/leads" className={colors.button.secondary}>
            Manage Leads
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      ) : null}

      {/* 4 summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Sale" value={loading ? '—' : String(metrics.totalSale)} subLabel="This period" />
        <StatCard label="Total Lead" value={loading ? '—' : String(metrics.totalLead)} subLabel="All leads" />
        <StatCard
          label="Total Revenue"
          value={loading ? '—' : formatMoney(metrics.totalRevenue)}
          subLabel="From converted leads"
        />
        <StatCard label="Total Customer" value={loading ? '—' : String(metrics.totalCustomer)} subLabel="Converted" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <section className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Insights</h2>
            <div className="text-sm text-gray-500">Month & year</div>
          </div>

          {loading ? (
            <div className="h-52 animate-pulse bg-gray-100 rounded-lg" />
          ) : (
            <RevenueInsightChart series={metrics.series} />
          )}
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Sale Overview</h2>
          <div className="mt-4">
            {loading ? (
              <div className="h-56 animate-pulse bg-gray-100 rounded-lg" />
            ) : (
              <SaleOverview
                totalLead={metrics.totalLead}
                totalSale={metrics.totalSale}
                totalRevenue={metrics.totalRevenue}
                deltaPercent={metrics.deltaPercent}
              />
            )}
          </div>
        </section>
      </div>

      {/* Recent sales table */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
          <div className="text-sm text-gray-500">{loading ? '' : 'Latest converted leads'}</div>
        </div>

        {loading ? (
          <div className="h-72 animate-pulse bg-gray-100 rounded-lg" />
        ) : recentSales.length === 0 ? (
          <div className="text-center py-10 text-gray-600">No converted leads yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Order Id</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((l) => {
                  const d = safeDate(l.convertedAt) || safeDate(l.createdAt);
                  const statusLabel = l.status === 'CONVERTED' ? 'Completed' : l.status;
                  const total = toCoverageAmount(l.coverageAmount);

                  return (
                    <tr key={l.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-600">{l.id.slice(0, 6).toUpperCase()}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{d ? d.toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {l.firstName} {l.lastName}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{l.leadType}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            l.status
                          )}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">1 item</td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                        {formatMoney(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

