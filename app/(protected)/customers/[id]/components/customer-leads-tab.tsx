'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { useCustomerLeads } from '@/lib/hooks/use-customer-detail';
import { getStatusColor } from '@/lib/theme/colors';
import { formatDate } from '@/lib/utils/date';
import EmptyState from '@/components/empty-state';

interface CustomerLeadsTabProps {
  customerId: string;
}

export default function CustomerLeadsTab({ customerId }: CustomerLeadsTabProps) {
  const { data: leads = [], isLoading } = useCustomerLeads(customerId);

  if (isLoading) return <p className="text-sm text-subtle">Loading leads...</p>;

  if (leads.length === 0) {
    return <EmptyState message="No leads linked to this customer yet" icon={<TrendingUp size={32} className="mx-auto text-subtle" />} />;
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <Link
          key={lead.id}
          href={`/leads/${lead.id}`}
          className="block surface border border-[var(--border)] rounded-xl p-4 hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-sm font-medium text-primary">{lead.firstName} {lead.lastName}</span>
              <p className="text-xs text-subtle mt-1">
                {lead.leadType.replace(/_/g, ' ')} · Created {formatDate(lead.createdAt)}
                {lead.convertedCustomerId === customerId && ' · Original conversion'}
              </p>
            </div>
            <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
              {lead.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
