'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { colors } from '@/lib/theme/colors';
import { useCustomersList } from '@/lib/hooks/use-customers';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import PaginationSummary from '@/components/pagination-summary';
import CustomerListView from './components/customer-list-view';
import CustomerCreateModal from './components/customer-create-modal';
import CustomerFilters from './components/customer-filters';

export default function CustomersPage() {
  const [showForm, setShowForm] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [sortBy, setSortBy] = useState<'createdAt' | 'firstName' | 'lastName' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading: loading, isError } = useCustomersList({
    page,
    limit,
    ...(search && { search }),
    sortBy,
    sortOrder,
    ...(statusFilter && { status: statusFilter }),
  });

  const customers = data?.data ?? [];
  const meta = data?.meta ?? null;
  const error = isError ? 'Failed to fetch customers' : null;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field as typeof sortBy);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Customers"
        error={error}
        actions={
          <button onClick={() => setShowForm(true)} className={colors.button.primary}>
            + Add Customer
          </button>
        }
      />

      <CustomerCreateModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => setPage(1)}
      />

      <CustomerFilters
        search={searchInput}
        statusFilter={statusFilter}
        sortBy={sortBy}
        onSearch={(v) => { setSearchInput(v); setPage(1); }}
        onStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
        onSortChange={(v) => setSortBy(v as typeof sortBy)}
      />
      {meta && <PaginationSummary meta={meta} page={page} limit={limit} label="customers" />}

      {loading ? (
        <LoadingSpinner message="Loading customers..." />
      ) : customers.length === 0 ? (
        <EmptyState
          message={search ? 'No customers found. Try adjusting your search.' : 'Convert a lead to see your first customer here.'}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            <CustomerListView
              customers={customers}
              meta={meta}
              page={page}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onPageChange={setPage}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
