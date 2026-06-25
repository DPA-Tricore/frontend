import Link from 'next/link';
import type { LeadResponseDto } from '@/lib/types/leads';

interface Props {
  leads: LeadResponseDto[];
}

export default function DashboardRecentLeads({ leads }: Props) {
  if (leads.length === 0) {
    return <div className="text-center py-10 text-muted text-sm">No leads yet.</div>;
  }

  return (
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
  );
}
