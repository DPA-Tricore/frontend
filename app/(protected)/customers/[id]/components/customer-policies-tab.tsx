'use client';

import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { useCustomerPolicies, useUpdatePolicy } from '@/lib/hooks/use-customer-detail';
import { getPolicyStatusColor } from '@/lib/theme/colors';
import { formatDate } from '@/lib/utils/date';
import { colors } from '@/lib/theme/colors';
import EmptyState from '@/components/empty-state';
import PolicyCreateModal from './policy-create-modal';

interface CustomerPoliciesTabProps {
  customerId: string;
}

const STATUS_OPTIONS = ['ACTIVE', 'LAPSED', 'CANCELLED', 'RENEWED'];

export default function CustomerPoliciesTab({ customerId }: CustomerPoliciesTabProps) {
  const { data: policies = [], isLoading } = useCustomerPolicies(customerId);
  const updatePolicy = useUpdatePolicy(customerId);
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) return <p className="text-sm text-subtle">Loading policies...</p>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className={`${colors.button.text} flex items-center gap-1.5`}
        >
          <Plus size={14} /> Add Policy
        </button>
      </div>

      <PolicyCreateModal customerId={customerId} isOpen={showCreate} onClose={() => setShowCreate(false)} />

      {policies.length === 0 ? (
        <EmptyState message="No policies yet" icon={<FileText size={32} className="mx-auto text-subtle" />} />
      ) : (
        <div className="space-y-3">
          {policies.map((policy) => (
            <div key={policy.id} className="surface border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-primary">{policy.policyNumber}</span>
                    {policy.productType && (
                      <span className="text-xs text-subtle">{policy.productType}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted mt-1">
                    ${(policy.premiumAmountCents / 100).toFixed(2)} / {policy.billingInterval.toLowerCase()}
                  </p>
                  <p className="text-xs text-subtle mt-1">
                    {formatDate(policy.effectiveDate)} – {formatDate(policy.expirationDate)}
                  </p>
                  {policy.renewalLeadId && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Renewal lead created</p>
                  )}
                </div>
                <select
                  value={policy.status}
                  onChange={(e) => updatePolicy.mutate({ policyId: policy.id, data: { status: e.target.value as typeof policy.status } })}
                  disabled={updatePolicy.isPending}
                  className={`shrink-0 text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer ${getPolicyStatusColor(policy.status)}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
