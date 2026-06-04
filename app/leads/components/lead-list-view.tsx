'use client';

import { LeadResponseDto, ContactResponseDto } from '@/lib/api/leads';
import { colors, getStatusColor } from '@/lib/theme/colors';
import { PaginationMeta } from '@/lib/types/common';
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
  return (
    <div className="space-y-4">
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
              <tr key={lead.id} className="border-b border-[var(--border)] hover:[background:var(--bg)]">
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
                <td className="px-6 py-4">
                  <button className={colors.button.text}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 ? (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted">
            Page {meta.page} of {meta.totalPages}
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={!meta.hasPrevPage}
              className={colors.pagination.button}
            >
              ← Previous
            </button>

            <div className="flex gap-1">
              {(() => {
                const pages: React.ReactNode[] = [];
                const maxPagesToShow = 7;
                let startPage = Math.max(1, meta.page - Math.floor(maxPagesToShow / 2));
                const endPage = Math.min(meta.totalPages, startPage + maxPagesToShow - 1);

                if (endPage - startPage + 1 < maxPagesToShow) {
                  startPage = Math.max(1, endPage - maxPagesToShow + 1);
                }

                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => onPageChange(1)}
                      className="px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-primary hover:opacity-70"
                    >
                      1
                    </button>,
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="dots-start" className="px-2 py-2 text-subtle">
                        ...
                      </span>,
                    );
                  }
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => onPageChange(i)}
                      className={i === meta.page ? colors.pagination.active : colors.pagination.inactive}
                    >
                      {i}
                    </button>,
                  );
                }

                if (endPage < meta.totalPages) {
                  if (endPage < meta.totalPages - 1) {
                    pages.push(
                      <span key="dots-end" className="px-2 py-2 text-subtle">
                        ...
                      </span>,
                    );
                  }
                  pages.push(
                    <button
                      key={meta.totalPages}
                      onClick={() => onPageChange(meta.totalPages)}
                      className="px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-primary hover:opacity-70"
                    >
                      {meta.totalPages}
                    </button>,
                  );
                }

                return pages;
              })()}
            </div>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!meta.hasNextPage}
              className={colors.pagination.button}
            >
              Next →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
