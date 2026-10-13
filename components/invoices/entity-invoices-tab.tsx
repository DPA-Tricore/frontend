'use client';

import { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { colors } from '@/lib/theme/colors';
import { INVOICE_EDITOR_ROLES } from '@/lib/constants/invoices';
import { useInvoices } from '@/lib/hooks/use-invoices';
import type { BillTo } from '@/lib/types/invoices';
import EmptyState from '@/components/empty-state';
import InvoiceTable from './invoice-table';
import InvoiceFormModal from './invoice-form-modal';

// The Invoices tab on a lead or customer page.
export default function EntityInvoicesTab({ billTo }: { billTo: BillTo }) {
  const { user } = useAuth();
  const canEdit = !!user?.role && INVOICE_EDITOR_ROLES.includes(user.role);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const filter = billTo.type === 'customer' ? { customerId: billTo.id } : { leadId: billTo.id };
  const { data: invoices = [], isLoading } = useInvoices(filter);

  if (isLoading) return <p className="text-sm text-subtle">Loading invoices...</p>;

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          <button onClick={() => setIsFormOpen(true)} className={`${colors.button.text} flex items-center gap-1.5`}>
            <Plus size={14} /> New Invoice
          </button>
        </div>
      )}

      {invoices.length === 0 ? (
        <EmptyState message="No invoices yet" icon={<Receipt size={32} className="mx-auto text-subtle" />} />
      ) : (
        <InvoiceTable invoices={invoices} showBillTo={false} />
      )}

      <InvoiceFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} billTo={billTo} />
    </div>
  );
}
