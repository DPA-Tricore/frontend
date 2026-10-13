'use client';

import { useRouter } from 'next/navigation';
import type { CustomerInvoiceResponseDto } from '@/lib/types/invoices';
import { formatCentsAsMoney } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import InvoiceStatusBadge from './invoice-status-badge';

interface InvoiceTableProps {
  invoices: CustomerInvoiceResponseDto[];
  // Off on a lead or customer page, where every row is for the same person.
  showBillTo?: boolean;
}

export default function InvoiceTable({ invoices, showBillTo = true }: InvoiceTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto surface rounded-lg border border-[var(--border)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)] [background:var(--bg)]">
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Invoice</th>
            {showBillTo && <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Bill To</th>}
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Due</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-primary">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              onClick={() => router.push(`/invoices/${invoice.id}`)}
              className="border-b border-[var(--border)] last:border-b-0 hover:[background:var(--bg)] cursor-pointer"
            >
              <td className="px-6 py-4 text-sm font-medium text-primary whitespace-nowrap">{invoice.invoiceNumber}</td>
              {showBillTo && (
                <td className="px-6 py-4 text-sm text-primary">
                  {invoice.billToName ?? '—'}
                  <span className="ml-2 text-xs text-subtle">{invoice.customerId ? 'Customer' : 'Lead'}</span>
                </td>
              )}
              <td className="px-6 py-4">
                <InvoiceStatusBadge status={invoice.status} />
              </td>
              <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">{formatDate(invoice.dueDate)}</td>
              <td className="px-6 py-4 text-sm text-primary text-right tabular-nums whitespace-nowrap">
                {formatCentsAsMoney(invoice.totalCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
