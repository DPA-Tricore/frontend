'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { billingApi } from '@/lib/api/billing';
import { useBillingInvoices, useBillingSchedule } from '@/lib/hooks/use-billing';
import { billingKeys } from '@/lib/queries/keys';
import PageHeader from '@/components/page-header';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import Pagination from '@/components/pagination';
import PaginationSummary from '@/components/pagination-summary';
import { getBillingScheduleStatusColor, getInvoiceStatusColor } from '@/lib/theme/colors';
import { formatCentsAsMoney } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import { APP_NAME } from '@/lib/constants/brand';

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT_METHOD: 'Pending Payment Method',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  SUPERSEDED: 'Superseded',
};

const LIMIT = 10;

export default function BillingPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const isOrgAdmin = user?.role === 'ORG_ADMIN';

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const scheduleQuery = useBillingSchedule({ enabled: isOrgAdmin });
  const invoicesQuery = useBillingInvoices({ page, limit: LIMIT }, { enabled: isOrgAdmin });
  const schedule = scheduleQuery.data ?? null;
  const hasSchedule = scheduleQuery.data !== null;
  const invoices = invoicesQuery.data?.data ?? [];
  const meta = invoicesQuery.data?.meta ?? null;
  const isLoading = scheduleQuery.isLoading || invoicesQuery.isLoading;
  const [actionError, setError] = useState<string | null>(null);
  const error =
    actionError ?? (scheduleQuery.isError || invoicesQuery.isError ? 'Failed to load billing information' : null);
  const [isStartingSetup, setIsStartingSetup] = useState(false);
  const [isPayingNow, setIsPayingNow] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isOrgAdmin) router.replace('/dashboard');
  }, [isAuthLoading, isOrgAdmin, router]);

  const handleAddPaymentMethod = async () => {
    setIsStartingSetup(true);
    setError(null);
    try {
      const { url } = await billingApi.setupPaymentMethod();
      window.location.href = url;
    } catch {
      setError('Failed to start payment setup — please try again');
      setIsStartingSetup(false);
    }
  };

  const handlePayNow = async () => {
    setIsPayingNow(true);
    setError(null);
    try {
      await billingApi.payNow();
      // Charging happens asynchronously in background-job — poll a few
      // times so the real outcome shows up here without a manual refresh.
      for (let i = 0; i < 4; i++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await queryClient.invalidateQueries({ queryKey: billingKeys.all });
      }
    } catch (err) {
      const message =
        err instanceof AxiosError && typeof err.response?.data?.message === 'string'
          ? err.response.data.message
          : 'Failed to retry payment — please try again';
      setError(message);
    } finally {
      setIsPayingNow(false);
    }
  };

  if (isAuthLoading || !isOrgAdmin) return <LoadingSpinner fullPage />;

  return (
    <div className="p-8">
      <PageHeader title="Billing" error={error} />

      {schedule?.organizationBillingStatus === 'SUSPENDED' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {schedule.status === 'PENDING_PAYMENT_METHOD'
            ? `Your free trial has ended, so your agency's access to ${APP_NAME} is paused. Add a payment method to get it back.`
            : `A payment didn't go through, so your agency's access to ${APP_NAME} is paused. Pay the open invoice or update your card to get it back.`}{' '}
          Your data is safe.
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner message="Loading billing information..." />
      ) : !hasSchedule ? (
        <EmptyState
          message={`No billing has been set up for your organization yet. Reach out to ${APP_NAME} if you think this is a mistake.`}
          icon={<CreditCard size={32} className="mx-auto text-subtle" />}
        />
      ) : (
        <>
          {schedule && (
            <div className="surface rounded-xl border border-[var(--border)] shadow-sm p-6 mb-8">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-3">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${getBillingScheduleStatusColor(schedule.status)}`}
                  >
                    {STATUS_LABELS[schedule.status] ?? schedule.status}
                  </span>
                  <p className="text-3xl font-bold text-primary">
                    {formatCentsAsMoney(schedule.effectiveAmountCents)}
                    <span className="text-base font-normal text-muted">
                      {' '}
                      / {schedule.interval.toLowerCase()}
                    </span>
                  </p>
                  <div className="text-sm text-muted space-y-1">
                    <p>Plan: {schedule.plan ? schedule.plan.name : 'Custom'}</p>
                    {schedule.customAmountCents == null &&
                      schedule.plan?.includedUsers != null &&
                      schedule.plan.extraUserAmountCents != null && (
                        <p>
                          Users: {schedule.activeUserCount} ({schedule.plan.includedUsers} included,{' '}
                          {formatCentsAsMoney(schedule.plan.extraUserAmountCents)} for each extra user)
                        </p>
                      )}
                    {schedule.discountPercent != null && <p>Discount: {schedule.discountPercent}% off</p>}
                    {schedule.freeUntil && <p>Free until {formatDate(schedule.freeUntil)}</p>}
                    {schedule.status === 'ACTIVE' && <p>Next billing date: {formatDate(schedule.nextBillingDate)}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {page === 1 && ['FAILED', 'OVERDUE'].includes(invoices[0]?.status) && (
                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={isPayingNow}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium interactive disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPayingNow ? 'Processing...' : 'Pay Now'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddPaymentMethod}
                    disabled={isStartingSetup}
                    className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-primary interactive disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStartingSetup
                      ? 'Redirecting...'
                      : schedule.stripeCustomerId
                        ? 'Update Payment Method'
                        : 'Add Payment Method'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold text-primary mb-4">Invoice History</h2>

          {invoices.length === 0 ? (
            <EmptyState message="No invoices yet." />
          ) : (
            <div className="surface rounded-xl border border-[var(--border)] shadow-sm p-6">
              {meta && <PaginationSummary meta={meta} page={page} limit={LIMIT} label="invoices" />}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted border-b border-[var(--border)]">
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 pr-4 font-medium">Amount</th>
                      <th className="py-2 pr-4 font-medium">Due Date</th>
                      <th className="py-2 pr-4 font-medium">Paid Date</th>
                      <th className="py-2 pr-4 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="py-3 pr-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${getInvoiceStatusColor(invoice.status)}`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-primary">{formatCentsAsMoney(invoice.amountCents)}</td>
                        <td className="py-3 pr-4 text-muted whitespace-nowrap">{formatDate(invoice.dueDate)}</td>
                        <td className="py-3 pr-4 text-muted whitespace-nowrap">{formatDate(invoice.paidAt)}</td>
                        <td className="py-3 pr-4 text-muted">{invoice.failureReason ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {meta && <Pagination meta={meta} page={page} onPageChange={setPage} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
