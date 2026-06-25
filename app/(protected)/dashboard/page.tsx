'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { leadsApi } from '@/lib/api/leads';
import { tasksApi } from '@/lib/api/tasks';
import { formatMoney } from '@/lib/utils/format';
import {
  type LeadLike,
  toCoverageAmount,
  safeDate,
  monthKey,
  getDisplayNameFromEmail,
} from '@/lib/utils/dashboard';
import { useReminders } from '@/lib/hooks/use-reminders';
import type { LeadResponseDto } from '@/lib/types/leads';
import type { TaskResponseDto } from '@/lib/types/tasks';
import DashboardRecentLeads from './components/dashboard-recent-leads';
import DashboardActionQueue from './components/dashboard-action-queue';

export default function DashboardPage() {
  const { user } = useAuth();
  const { pendingCount } = useReminders();
  const [leads, setLeads] = useState<LeadResponseDto[]>([]);
  const [tasks, setTasks] = useState<TaskResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [leadsRes, tasksRes] = await Promise.all([
          leadsApi.getLeads(),
          tasksApi.getTasks({ sortBy: 'dueDate', sortOrder: 'asc', limit: 50 }),
        ]);
        if (!cancelled) {
          setLeads(Array.isArray(leadsRes) ? leadsRes : (leadsRes as any).data ?? []);
          const raw = Array.isArray(tasksRes) ? tasksRes : (tasksRes as any).data ?? [];
          setTasks(raw);
        }
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
    const totalLeads = leads.length;

    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const pendingTasks = tasks.filter(
      (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED',
    );
    const dueTodayCount = pendingTasks.filter(
      (t) => new Date(t.dueDate) <= todayEnd,
    ).length;

    const converted = leads.filter((l) => l.status === 'CONVERTED' || !!l.convertedCustomerId);
    const currentMonth = monthKey(now);
    const revenueThisMonth = converted
      .filter((l) => {
        const d = safeDate((l as LeadLike).convertedAt as string) || safeDate(l.createdAt);
        return d && monthKey(d) === currentMonth;
      })
      .reduce((sum, l) => sum + toCoverageAmount((l as LeadLike).coverageAmount), 0);

    return { totalLeads, dueTodayCount, revenueThisMonth, pendingTasks };
  }, [leads, tasks]);

  const recentLeads = useMemo(
    () =>
      leads
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [leads],
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
            <p className="text-2xl font-bold text-primary">{formatMoney(metrics.revenueThisMonth)}</p>
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
              <span className="text-base font-bold text-primary">{metrics.totalLeads}</span>
              <span className="text-sm text-muted ml-1.5">leads</span>
            </span>
            <span className="text-[var(--border)]" aria-hidden>·</span>
            <span>
              <span className="text-base font-bold text-primary">{metrics.dueTodayCount}</span>
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
          {loading ? skeleton : <DashboardRecentLeads leads={recentLeads} />}
        </section>

        <section className="surface rounded-lg border border-[var(--border)] p-6">
          <h2 className="text-base font-semibold text-primary mb-5">Today's Actions</h2>
          {loading ? skeleton : <DashboardActionQueue tasks={metrics.pendingTasks} />}
        </section>
      </div>
    </div>
  );
}
