'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { colors } from '@/lib/theme/colors';
import { INVOICE_EDITOR_ROLES, INVOICE_STATUS_TABS } from '@/lib/constants/invoices';
import { useInvoices } from '@/lib/hooks/use-invoices';
import type { CustomerInvoiceStatus } from '@/lib/types/invoices';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import InvoiceTable from '@/components/invoices/invoice-table';
import InvoiceFormModal from '@/components/invoices/invoice-form-modal';

export default function InvoicesPage() {
  const { user } = useAuth();
  const canEdit = !!user?.role && INVOICE_EDITOR_ROLES.includes(user.role);
  const [status, setStatus] = useState<CustomerInvoiceStatus | ''>('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: invoices = [], isLoading, isError } = useInvoices(status ? { status } : {});

  return (
    <div className="p-8">
      <PageHeader
        title="Invoices"
        error={isError ? 'Failed to fetch invoices' : null}
        actions={
          canEdit && (
            <button onClick={() => setIsFormOpen(true)} className={colors.button.primary}>
              + New Invoice
            </button>
          )
        }
      />

      <div className="border-b border-[var(--border)] mb-6">
        <nav className="flex gap-6">
          {INVOICE_STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatus(tab.value)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                status === tab.value
                  ? 'border-gray-900 text-primary dark:border-white'
                  : 'border-transparent text-subtle hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading invoices..." />
      ) : invoices.length === 0 ? (
        <EmptyState message={status ? 'No invoices with this status.' : 'No invoices yet.'} />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            <InvoiceTable invoices={invoices} />
          </motion.div>
        </AnimatePresence>
      )}

      <InvoiceFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
