'use client';

import { ChevronDown } from 'lucide-react';
import { LeadResponseDto } from '@/lib/api/leads';
import { useAuth } from '@/context/auth-context';
import { useAssignLead } from '@/lib/hooks/use-leads';
import { useUsers } from '@/lib/hooks/use-users';
import { userDisplayName } from '@/lib/utils/user-name';
import { ASSIGNABLE_ROLES, CAN_ASSIGN_ROLES } from '@/lib/constants/leads';
import ContactsSection from '@/components/contacts/contacts-section';

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
      <span className="text-xs text-subtle shrink-0">{label}</span>
      <span className="text-xs text-primary font-medium text-right">{value}</span>
    </div>
  );
}

interface LeadPropertiesPanelProps {
  lead: LeadResponseDto;
}

export default function LeadPropertiesPanel({ lead }: LeadPropertiesPanelProps) {
  const { user } = useAuth();
  const { data: users = [] } = useUsers();
  const agents = users.filter((u) => u.isActive && ASSIGNABLE_ROLES.includes(u.role));
  const assignLead = useAssignLead();
  const canAssign = !!user?.role && CAN_ASSIGN_ROLES.includes(user.role);
  const assignedAgent = agents.find((a) => a.id === lead.assignedAgentId);
  const assignedAgentName = assignedAgent ? userDisplayName(assignedAgent) : undefined;

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    assignLead.mutate({ id: lead.id, agentId: e.target.value || null });
  };

  const interestedIn = lead.interestedProducts?.map((p) => p.name).join(', ');
  const hasQualification =
    lead.source || lead.budgetRange || lead.coverageAmount || lead.riskProfile || interestedIn;
  const hasAttribution = lead.utmSource || lead.utmMedium || lead.utmCampaign || lead.campaignId;

  return (
    <aside className="surface border border-[var(--border)] rounded-xl p-5 space-y-0">
      <ContactsSection owner={{ type: 'lead', id: lead.id }} contacts={lead.contacts ?? []} />
      <div className="border-b border-[var(--border)] my-4" />

      {/* Assigned to */}
      <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-2">Assigned To</p>
      {canAssign ? (
        <select
          value={lead.assignedAgentId ?? ''}
          onChange={handleAssigneeChange}
          disabled={assignLead.isPending}
          className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-primary cursor-pointer focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        >
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{userDisplayName(a)}</option>
          ))}
        </select>
      ) : (
        <p className="text-xs text-primary font-medium">{assignedAgentName ?? 'Unassigned'}</p>
      )}

      {/* Qualification */}
      {hasQualification && (
        <>
          <div className="border-b border-[var(--border)] my-4" />
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-1">Qualification</p>
          <Row label="Source" value={lead.source} />
          <Row label="Interested In" value={interestedIn} />
          <Row label="Budget" value={lead.budgetRange} />
          <Row label="Coverage" value={lead.coverageAmount ? `$${lead.coverageAmount}` : null} />
          <Row label="Risk Profile" value={lead.riskProfile} />
        </>
      )}

      {/* Attribution — collapsed by default, low priority for day-to-day work */}
      {hasAttribution && (
        <>
          <div className="border-b border-[var(--border)] my-4" />
          <details className="group">
            <summary className="text-xs font-semibold text-subtle uppercase tracking-wide cursor-pointer list-none flex items-center justify-between">
              Attribution
              <ChevronDown size={13} className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-2">
              <Row label="Campaign" value={lead.campaignId} />
              <Row label="UTM Source" value={lead.utmSource} />
              <Row label="UTM Medium" value={lead.utmMedium} />
              <Row label="UTM Campaign" value={lead.utmCampaign} />
            </div>
          </details>
        </>
      )}

      <div className="border-b border-[var(--border)] my-4" />
      <p className="text-xs text-subtle font-mono break-all">{lead.id}</p>
    </aside>
  );
}
