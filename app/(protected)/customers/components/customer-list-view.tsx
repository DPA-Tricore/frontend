'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CustomerResponseDto } from '@/lib/api/customers';
import { getCustomerStatusColor } from '@/lib/theme/colors';
import { PaginationMeta } from '@/lib/types/common';
import Pagination from '@/components/pagination';

function getPrimaryContact(contacts?: CustomerResponseDto['contacts']) {
  if (!contacts || contacts.length === 0) return null;
  return contacts.find((c) => c.isPrimary) ?? contacts[0];
}

interface SortIconProps {
  field: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

function SortIcon({ field, sortBy, sortOrder }: SortIconProps) {
  if (sortBy !== field) return <span className="text-subtle">⇅</span>;
  return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
}

interface CustomerListViewProps {
  customers: CustomerResponseDto[];
  meta: PaginationMeta | null;
  page: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
}

export default function CustomerListView({
  customers,
  meta,
  page,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
}: CustomerListViewProps) {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
        >
          <div className="overflow-x-auto surface rounded-lg border border-[var(--border)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] [background:var(--bg)]">
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => onSort('firstName')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <SortIcon field="firstName" sortBy={sortBy} sortOrder={sortOrder} />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => onSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <SortIcon field="status" sortBy={sortBy} sortOrder={sortOrder} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Contact</th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => onSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Created
                      <SortIcon field="createdAt" sortBy={sortBy} sortOrder={sortOrder} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const primaryContact = getPrimaryContact(customer.contacts);
                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-[var(--border)] hover:[background:var(--bg)] cursor-pointer"
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-primary">
                          {customer.firstName} {customer.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCustomerStatusColor(customer.status)}`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted">
                          {primaryContact ? `${primaryContact.type.toLowerCase()}: ${primaryContact.value}` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted">
                          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </AnimatePresence>

      {meta && <Pagination meta={meta} page={page} onPageChange={onPageChange} />}
    </div>
  );
}
