'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { LeadResponseDto } from '@/lib/api/leads';
import { useUpdateLeadStatus } from '@/lib/hooks/use-leads';
import { useUsers } from '@/lib/hooks/use-users';
import { userDisplayName } from '@/lib/utils/user-name';
import { formatDate } from '@/lib/utils/date';
import { AVATAR_COLORS } from '@/lib/constants/leads';
import LeadStageStepper from './lead-stage-stepper';
import ConvertLeadModal from './convert-lead-modal';

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
  const router = useRouter();
  const { data: users = [] } = useUsers();
  const updateStatus = useUpdateLeadStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fullName = `${lead.firstName} ${lead.lastName}`;
  const initials = `${lead.firstName[0] ?? ''}${lead.lastName[0] ?? ''}`.toUpperCase();
  const assignedAgent = users.find((u) => u.id === lead.assignedAgentId);
  const assignedAgentName = assignedAgent ? userDisplayName(assignedAgent) : undefined;

  // CONVERTED is intercepted — it goes through the dedicated convert flow (dedupe check
  // against existing customers) rather than a plain status PATCH, so it's routed here
  // whether triggered from the stage stepper's dot or the menu item below.
  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'CONVERTED') {
      setShowConvertModal(true);
      return;
    }
    updateStatus.mutate({ lead, newStatus });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-subtle hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="More actions"
          >
            <MoreHorizontal size={20} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 surface border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-20">
              <button
                onClick={() => { setMenuOpen(false); onEditClick(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Edit
              </button>
              {lead.status !== 'CONVERTED' && (
                <button
                  onClick={() => { setMenuOpen(false); handleStatusChange('CONVERTED'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Convert to Customer
                </button>
              )}
              {lead.status !== 'LOST' && (
                <>
                  <div className="border-t border-[var(--border)]" />
                  <button
                    onClick={() => { setMenuOpen(false); handleStatusChange('LOST'); }}
                    disabled={updateStatus.isPending}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40"
                  >
                    Mark Lost
                  </button>
                </>
              )}
            </div>
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
            <span className="text-white text-xs font-bold">{assignedAgentName?.[0]?.toUpperCase() ?? '?'}</span>
          </div>
          <span className="text-subtle">{assignedAgentName ?? 'Unassigned'}</span>
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

      <ConvertLeadModal
        leadId={lead.id}
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onConverted={(customerId) => {
          setShowConvertModal(false);
          router.push(`/customers/${customerId}`);
        }}
      />
    </div>
  );
}
