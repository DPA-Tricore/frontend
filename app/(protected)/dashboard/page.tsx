'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useDashboardSummary } from '@/lib/hooks/use-dashboard';
import { formatMoney } from '@/lib/utils/format';
import { getDisplayNameFromEmail } from '@/lib/utils/dashboard';
import { useReminders } from '@/lib/hooks/use-reminders';
import DashboardRecentLeads from './components/dashboard-recent-leads';
import DashboardActionQueue from './components/dashboard-action-queue';

export default function DashboardPage() {
  const { user } = useAuth();
  const { pendingCount } = useReminders();

  const { data: summary, isLoading: loading, isError } = useDashboardSummary();
  const error = isError ? 'Failed to load dashboard data' : null;

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

  const skeleton = <div className="animate-pulse bg-[var(--border)] rounded-lg min-h-[120px]" />;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-xs text-muted">{dateLabel}</p>
          <h1 className="text-2xl font-bold text-primary mt-0.5">Welcome back, {name}</h1>
        </div>
        {!loading && (
          <div className="text-right">
            <p className="text-xs text-muted mb-0.5">Revenue this month</p>
            <p className="text-2xl font-bold text-primary">{formatMoney(summary?.revenueThisMonth ?? 0)}</p>
          </div>
        )}
      </div>

      {/* Metrics strip */}
      <div className="flex items-center gap-6 mb-8 pb-5 border-b border-[var(--border)]">
        {loading ? (
          <div className="h-4 w-56 animate-pulse bg-[var(--border)] rounded" />
        ) : (
          <>
            <span>
              <span className="text-base font-bold text-primary">{summary?.totalLeads ?? 0}</span>
              <span className="text-sm text-muted ml-1.5">leads</span>
            </span>
            <span className="text-[var(--border)]" aria-hidden>·</span>
            <span>
              <span className="text-base font-bold text-primary">{summary?.dueTodayCount ?? 0}</span>
              <span className="text-sm text-muted ml-1.5">tasks due</span>
            </span>
            <span className="text-[var(--border)]" aria-hidden>·</span>
            <span>
              <span className="text-base font-bold text-primary">{pendingCount}</span>
              <span className="text-sm text-muted ml-1.5">pending reminders</span>
            </span>
          </>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 surface rounded-lg border border-[var(--border)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-primary">Recent Leads</h2>
            <Link href="/leads" className="text-xs text-muted hover:text-primary transition-colors">
              View all →
            </Link>
          </div>
          {loading ? skeleton : <DashboardRecentLeads leads={summary?.recentLeads ?? []} />}
        </section>

        <section className="surface rounded-lg border border-[var(--border)] p-6">
          <h2 className="text-base font-semibold text-primary mb-5">Today's Actions</h2>
          {loading ? skeleton : <DashboardActionQueue dueTasks={summary?.dueTasks ?? []} />}
        </section>
      </div>
    </div>
  );
}
