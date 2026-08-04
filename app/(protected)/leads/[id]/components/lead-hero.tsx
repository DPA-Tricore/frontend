'use client';

import { Pencil, CheckCircle2, XCircle } from 'lucide-react';
import { LeadResponseDto } from '@/lib/api/leads';
import { useUpdateLeadStatus } from '@/lib/hooks/use-leads';
import { useUsers } from '@/lib/hooks/use-users';
import { formatDate } from '@/lib/utils/date';
import { AVATAR_COLORS } from '@/lib/constants/leads';
import LeadStageStepper from './lead-stage-stepper';

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface LeadHeroProps {
  lead: LeadResponseDto;
  onEditClick: () => void;
}

export default function LeadHero({ lead, onEditClick }: LeadHeroProps) {
  const { data: users = [] } = useUsers();
  const updateStatus = useUpdateLeadStatus();

  const fullName = `${lead.firstName} ${lead.lastName}`;
  const initials = `${lead.firstName[0] ?? ''}${lead.lastName[0] ?? ''}`.toUpperCase();
  const assignedAgentEmail = users.find((u) => u.id === lead.assignedAgentId)?.email;

  const handleStatusChange = (newStatus: string) => updateStatus.mutate({ lead, newStatus });

  return (
    <div>
      {/* Category */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-subtle">
          {lead.leadType.replace(/_/g, ' ')}
        </span>
        {lead.source && <span className="text-xs text-subtle">via {lead.source}</span>}
      </div>

      {/* Identity + actions */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-12 h-12 rounded-full ${avatarColor(fullName)} flex items-center justify-center shrink-0`}>
            <span className="text-white text-base font-bold">{initials}</span>
          </div>
          <h1 className="text-3xl font-bold text-primary leading-tight truncate">{fullName}</h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEditClick}
            aria-label="Edit lead"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-subtle hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <Pencil size={16} />
          </button>
          {lead.status !== 'CONVERTED' && (
            <button
              onClick={() => handleStatusChange('CONVERTED')}
              disabled={updateStatus.isPending}
              className="flex items-center gap-1.5 text-sm px-3.5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
            >
              <CheckCircle2 size={15} /> Convert
            </button>
          )}
          {lead.status !== 'LOST' && (
            <button
              onClick={() => handleStatusChange('LOST')}
              disabled={updateStatus.isPending}
              className="flex items-center gap-1.5 text-sm px-3.5 py-2 border border-[var(--border)] text-subtle rounded-lg hover:text-red-600 hover:border-red-200 dark:hover:border-red-900 transition-colors font-medium disabled:opacity-50"
            >
              <XCircle size={15} /> Mark Lost
            </button>
          )}
        </div>
      </div>

      {/* Journey */}
      <div className="mb-5">
        <LeadStageStepper status={lead.status} onChange={handleStatusChange} disabled={updateStatus.isPending} />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{assignedAgentEmail?.[0]?.toUpperCase() ?? '?'}</span>
          </div>
          <span className="text-subtle">{assignedAgentEmail ?? 'Unassigned'}</span>
        </div>
        <span className="text-[var(--border)]">·</span>
        <span className="text-subtle">Created {formatDate(lead.createdAt)}</span>
        {lead.convertedAt && (
          <>
            <span className="text-[var(--border)]">·</span>
            <span className="text-emerald-600 dark:text-emerald-400">Converted {formatDate(lead.convertedAt)}</span>
          </>
        )}
      </div>
    </div>
  );
}
