'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LeadResponseDto, ContactResponseDto } from '@/lib/api/leads';
import { colors, getStatusColor } from '@/lib/theme/colors';
import { PaginationMeta } from '@/lib/types/common';
import Pagination from '@/components/pagination';
import { getPrimaryContact } from './lead-card';

type Lead = LeadResponseDto;
type Contact = ContactResponseDto;

const getContactDisplay = (contact: Contact | null): string => {
  if (!contact) return '—';
  return `${contact.type.toLowerCase()}: ${contact.value}`;
};

interface SortIconProps {
  field: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

function SortIcon({ field, sortBy, sortOrder }: SortIconProps) {
  if (sortBy !== field) return <span className="text-subtle">⇅</span>;
  return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
}

interface LeadListViewProps {
  leads: Lead[];
  meta: PaginationMeta | null;
  page: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
}

export default function LeadListView({
  leads,
  meta,
  page,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
}: LeadListViewProps) {
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
                onClick={() => onSort('leadType')}
              >
                <div className="flex items-center gap-2">
                  Lead Type
                  <SortIcon field="leadType" sortBy={sortBy} sortOrder={sortOrder} />
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Source</th>
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-[var(--border)] hover:[background:var(--bg)] cursor-pointer"
                onClick={() => router.push(`/leads/${lead.id}`)}
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-primary">
                    {lead.firstName} {lead.lastName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted">{lead.leadType}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted">{lead.source || '—'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted">
                    {getContactDisplay(getPrimaryContact(lead.contacts))}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—'}
                  </span>
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <button className={colors.button.text}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      </motion.div>
      </AnimatePresence>

      {meta && <Pagination meta={meta} page={page} onPageChange={onPageChange} />}
    </div>
  );
}
