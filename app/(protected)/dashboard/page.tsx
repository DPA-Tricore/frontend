'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { leadsApi } from '@/lib/api/leads';
import { tasksApi } from '@/lib/api/tasks';
import { colors } from '@/lib/theme/colors';
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
import ReminderWidget from '@/components/reminder-widget';
import DashboardStatCard from './components/dashboard-stat-card';
import DashboardRecentLeads from './components/dashboard-recent-leads';
import DashboardPendingTasks from './components/dashboard-pending-tasks';

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
        .slice(0, 5),
    [leads],
  );

  const upcomingTasks = useMemo(() => metrics.pendingTasks.slice(0, 5), [metrics.pendingTasks]);

  const skeleton = <div className="animate-pulse bg-[var(--border)] rounded-lg min-h-[120px]" />;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 gap-4">
        <div>
          <p className="text-sm text-muted">{dateLabel}</p>
          <h1 className="text-3xl font-bold text-primary mt-1">Welcome back, {name}!</h1>
          <p className="text-muted mt-2">Here's what needs your attention today.</p>
        </div>
        <Link href="/leads" className={colors.button.secondary}>
          Manage Leads
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <DashboardStatCard
          label="Total Leads"
          value={loading ? '—' : String(metrics.totalLeads)}
          subLabel="All time"
        />
        <DashboardStatCard
          label="Tasks Due"
          value={loading ? '—' : String(metrics.dueTodayCount)}
          subLabel="Today & overdue"
        />
        <DashboardStatCard
          label="Pending Reminders"
          value={String(pendingCount)}
          subLabel="Needs attention"
        />
        <DashboardStatCard
          label="Revenue This Month"
          value={loading ? '—' : formatMoney(metrics.revenueThisMonth)}
          subLabel="From converted leads"
        />
      </div>

      {/* Recent Leads + Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <section className="lg:col-span-2 surface rounded-lg border border-[var(--border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Recent Leads</h2>
            <Link href="/leads" className="text-sm text-muted hover:text-primary transition-colors">
              View all →
            </Link>
          </div>
          {loading ? skeleton : <DashboardRecentLeads leads={recentLeads} />}
        </section>

        <ReminderWidget limit={5} />
      </div>

      {/* Pending Tasks */}
      <section className="surface rounded-lg border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Pending Tasks</h2>
          <Link href="/tasks" className="text-sm text-muted hover:text-primary transition-colors">
            View all →
          </Link>
        </div>
        {loading
          ? <div className="animate-pulse bg-[var(--border)] rounded-lg h-32" />
          : <DashboardPendingTasks tasks={upcomingTasks} />
        }
      </section>
    </div>
  );
}
