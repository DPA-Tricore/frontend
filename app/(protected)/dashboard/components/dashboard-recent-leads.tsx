import Link from 'next/link';
import { Plus, Upload, UserPlus } from 'lucide-react';
import type { LeadResponseDto } from '@/lib/types/leads';
import { RECENT_LEADS_PROMPT_BELOW } from '@/lib/constants/dashboard';
import DashboardPrompt from './dashboard-prompt';

interface Props {
  leads: LeadResponseDto[];
  onAddLead: () => void;
}

export default function DashboardRecentLeads({ leads, onAddLead }: Props) {
  return (
    <div className="flex-1 flex flex-col gap-4">
      {leads.length > 0 && (
        <div className="divide-y divide-[var(--border)]">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="flex items-center justify-between py-3 px-1 rounded transition-colors hover:[background:var(--bg)] group"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary truncate group-hover:underline">
                  {lead.firstName} {lead.lastName}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {lead.leadType.replace(/_/g, ' ')} · {new Date(lead.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="ml-3 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border border-[var(--border)] text-muted">
                {lead.status.replace(/_/g, ' ')}
              </span>
            </Link>
          ))}
        </div>
      )}

      {leads.length < RECENT_LEADS_PROMPT_BELOW && (
        <DashboardPrompt
          icon={UserPlus}
          title={leads.length === 0 ? 'No leads yet' : undefined}
          message="Add leads one at a time, or import a list."
        >
          <button
            type="button"
            onClick={onAddLead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg text-primary transition-colors hover:opacity-70"
          >
            <Plus size={14} />
            Add lead
          </button>
          <Link
            href="/leads/import"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg text-primary transition-colors hover:opacity-70"
          >
            <Upload size={14} />
            Import CSV
          </Link>
        </DashboardPrompt>
      )}
    </div>
  );
}
