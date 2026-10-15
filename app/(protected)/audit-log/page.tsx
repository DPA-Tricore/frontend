'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { activitiesApi } from '@/lib/api/activities';
import type { AuditLogEntryDto } from '@/lib/types/activities';
import LoadingSpinner from '@/components/loading-spinner';
import { formatDateTime } from '@/lib/utils/date';
import PageHeader from '@/components/page-header';

const ENTITY_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  TASK: 'Task',
  REMINDER: 'Reminder',
  USER: 'User',
  TEAM: 'Team',
  ORGANIZATION: 'Organization',
};

export default function AuditLogPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [entries, setEntries] = useState<AuditLogEntryDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOrgAdmin = user?.role === 'ORG_ADMIN';

  const fetchPage = useCallback(async (pageToFetch: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await activitiesApi.getAuditLog({ page: pageToFetch, limit: 25 });
      setEntries(result.data);
      setTotalPages(result.meta.totalPages);
    } catch {
      setError('Failed to load audit log');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isOrgAdmin) {
      router.replace('/dashboard');
      return;
    }
    fetchPage(page);
  }, [isAuthLoading, isOrgAdmin, router, fetchPage, page]);

  if (isAuthLoading || !isOrgAdmin) return <LoadingSpinner fullPage />;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Audit Log" />

      <div className="surface rounded-xl border border-[var(--border)] shadow-sm p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b border-[var(--border)]">
                    <th className="py-2 pr-4 font-medium">When</th>
                    <th className="py-2 pr-4 font-medium">Actor</th>
                    <th className="py-2 pr-4 font-medium">Entity</th>
                    <th className="py-2 pr-4 font-medium">Action</th>
                    <th className="py-2 pr-4 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted">No activity yet</td>
                    </tr>
                  )}
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="py-3 pr-4 text-muted whitespace-nowrap">{formatDateTime(entry.createdAt)}</td>
                      <td className="py-3 pr-4 text-primary">{entry.actorEmail ?? 'System'}</td>
                      <td className="py-3 pr-4 text-muted">{ENTITY_LABELS[entry.entityType] ?? entry.entityType}</td>
                      <td className="py-3 pr-4 text-muted">{entry.action.replace(/_/g, ' ')}</td>
                      <td className="py-3 pr-4 text-primary">{entry.message ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="text-sm px-3 py-1.5 border border-[var(--border)] rounded-lg text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-70"
                >
                  Previous
                </button>
                <span className="text-xs text-muted">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="text-sm px-3 py-1.5 border border-[var(--border)] rounded-lg text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-70"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
