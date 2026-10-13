'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { colors } from '@/lib/theme/colors';
import { INVOICE_ADMIN_ROLES, INVOICE_EDITOR_ROLES } from '@/lib/constants/invoices';
import { useDeleteInvoice, useInvoice, useInvoiceAction } from '@/lib/hooks/use-invoices';
import { CustomerInvoiceStatus, type InvoiceAction } from '@/lib/types/invoices';
import { formatCentsAsMoney } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import LoadingSpinner from '@/components/loading-spinner';
import InvoiceStatusBadge from '@/components/invoices/invoice-status-badge';
import InvoiceFormModal from '@/components/invoices/invoice-form-modal';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: invoice, isLoading, isError } = useInvoice(id);
  const runAction = useInvoiceAction();
  const deleteInvoice = useDeleteInvoice();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isError) router.push('/invoices');
  }, [isError, router]);

  if (isLoading) return <LoadingSpinner message="Loading invoice..." />;
  if (!invoice) return null;

  const role = user?.role ?? '';
  const canEdit = INVOICE_EDITOR_ROLES.includes(role);
  const canAdmin = INVOICE_ADMIN_ROLES.includes(role);
  const { status } = invoice;
  const isOpen = status === CustomerInvoiceStatus.SENT || status === CustomerInvoiceStatus.OVERDUE;

  const act = async (action: InvoiceAction, confirmText?: string) => {
    if (confirmText && !confirm(confirmText)) return;
    setError(null);
    try {
      await runAction.mutateAsync({ id: invoice.id, action });
    } catch {
      setError('That didn’t work. Refresh and try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete draft ${invoice.invoiceNumber}?`)) return;
    try {
      await deleteInvoice.mutateAsync(invoice.id);
      router.push('/invoices');
    } catch {
      setError('Failed to delete invoice');
    }
  };

  const billToHref = invoice.customerId ? `/customers/${invoice.customerId}` : `/leads/${invoice.leadId}`;
  const busy = runAction.isPending || deleteInvoice.isPending;

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-primary">{invoice.invoiceNumber}</h1>
            <InvoiceStatusBadge status={status} />
          </div>
          <p className="text-muted mt-2">
            Billed to{' '}
            <Link href={billToHref} className="text-primary font-medium hover:underline">
              {invoice.billToName ?? 'Unknown'}
            </Link>
            <span className="text-subtle text-sm"> · {invoice.customerId ? 'Customer' : 'Lead'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canEdit && status === CustomerInvoiceStatus.DRAFT && (
            <>
              <button onClick={() => setIsEditOpen(true)} disabled={busy} className={colors.button.secondary}>
                Edit
              </button>
              <button
                onClick={() => act('send', 'Mark this invoice as sent? It can no longer be edited after.')}
                disabled={busy}
                className={colors.button.primary}
              >
                Mark as Sent
              </button>
            </>
          )}
          {canEdit && isOpen && (
            <button onClick={() => act('mark-paid')} disabled={busy} className={colors.button.primary}>
              Mark as Paid
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 text-sm">
        <div>
          <p className="text-subtle">Issued</p>
          <p className="text-primary mt-1">{formatDate(invoice.issueDate)}</p>
        </div>
        <div>
          <p className="text-subtle">Due</p>
          <p className="text-primary mt-1">{formatDate(invoice.dueDate)}</p>
        </div>
        <div>
          <p className="text-subtle">Sent</p>
          <p className="text-primary mt-1">{formatDate(invoice.sentAt)}</p>
        </div>
        <div>
          <p className="text-subtle">Paid</p>
          <p className="text-primary mt-1">{formatDate(invoice.paidAt)}</p>
        </div>
      </div>

      <div className="surface rounded-lg border border-[var(--border)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] [background:var(--bg)]">
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Item</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-primary">Qty</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-primary">Price</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-primary">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--border)]">
                <td className="px-6 py-4 text-sm text-primary">{item.description}</td>
                <td className="px-6 py-4 text-sm text-muted text-right tabular-nums">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-muted text-right tabular-nums">
                  {formatCentsAsMoney(item.unitPriceCents)}
                </td>
                <td className="px-6 py-4 text-sm text-primary text-right tabular-nums">
                  {formatCentsAsMoney(item.amountCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 flex justify-end">
          <dl className="w-64 space-y-1 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatCentsAsMoney(invoice.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Tax</dt>
              <dd className="tabular-nums">{formatCentsAsMoney(invoice.taxCents)}</dd>
            </div>
            <div className="flex justify-between font-semibold text-primary text-base pt-2 border-t border-[var(--border)]">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatCentsAsMoney(invoice.totalCents)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-6">
          <p className="text-sm text-subtle mb-1">Notes</p>
          <p className="text-sm text-primary whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {canAdmin && (status === CustomerInvoiceStatus.DRAFT || isOpen) && (
        <div className="mt-10 pt-6 border-t border-[var(--border)]">
          {status === CustomerInvoiceStatus.DRAFT ? (
            <button onClick={handleDelete} disabled={busy} className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50">
              Delete draft
            </button>
          ) : (
            <button
              onClick={() => act('void', `Void ${invoice.invoiceNumber}? The client no longer owes this amount. This can’t be undone.`)}
              disabled={busy}
              className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              Void invoice
            </button>
          )}
        </div>
      )}

      <InvoiceFormModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} invoice={invoice} />
    </div>
  );
}
