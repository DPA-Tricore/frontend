'use client';

import { useState, useEffect } from 'react';
import { leadsApi, LeadResponseDto, ContactResponseDto } from '@/lib/api/leads';
import { usersApi } from '@/lib/api/users';
import type { OrgUserResponseDto } from '@/lib/types/users';
import { useAuth } from '@/context/auth-context';
import { getStatusColor } from '@/lib/theme/colors';

// ── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-rose-500', 'bg-cyan-500',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Contact type icons ────────────────────────────────────────────────────────
const CONTACT_ICONS: Record<string, string> = {
  EMAIL: '✉️',
  PHONE: '📞',
  WHATSAPP: '💬',
  FACEBOOK: '👥',
  TELEGRAM: '✈️',
  LINKEDIN: '🔗',
  TWITTER: '🐦',
  INSTAGRAM: '📸',
  WEBSITE: '🌐',
  OTHER: '📋',
};

const LEAD_STATUSES = [
  'NEW', 'CONTACTED', 'QUALIFIED', 'IN_NEGOTIATION', 'CONVERTED', 'LOST', 'UNRESPONSIVE',
];

// ── Field row ─────────────────────────────────────────────────────────────────
function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-2 py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-xs text-subtle shrink-0">{label}</span>
      <span className="text-xs text-primary text-right font-medium">{value}</span>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface LeadProfilePanelProps {
  lead: LeadResponseDto;
  onStatusChange: (newStatus: string) => void;
  onAssigneeChange: (agentId: string | null) => void;
  onEditClick: () => void;
}

const ASSIGNABLE_ROLES = ['AGENT', 'MANAGER'];
const CAN_ASSIGN_ROLES = ['ORG_ADMIN', 'MANAGER'];

export default function LeadProfilePanel({ lead, onStatusChange, onAssigneeChange, onEditClick }: LeadProfilePanelProps) {
  const { user } = useAuth();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingAssignee, setUpdatingAssignee] = useState(false);
  const [agents, setAgents] = useState<OrgUserResponseDto[]>([]);
  const initials = `${lead.firstName[0] ?? ''}${lead.lastName[0] ?? ''}`.toUpperCase();
  const fullName = `${lead.firstName} ${lead.lastName}`;
  const canAssign = !!user?.role && CAN_ASSIGN_ROLES.includes(user.role);

  useEffect(() => {
    usersApi.getUsers()
      .then((users) => setAgents(users.filter((u) => u.isActive && ASSIGNABLE_ROLES.includes(u.role))))
      .catch(() => {});
  }, []);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setUpdatingStatus(true);
    try {
      await leadsApi.updateLead(lead.id, { status: newStatus });
      onStatusChange(newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssigneeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agentId = e.target.value || null;
    setUpdatingAssignee(true);
    try {
      await leadsApi.assignLead(lead.id, agentId);
      onAssigneeChange(agentId);
    } finally {
      setUpdatingAssignee(false);
    }
  };

  const assignedAgentEmail = agents.find((a) => a.id === lead.assignedAgentId)?.email;

  return (
    <aside className="w-72 shrink-0 space-y-5">
      {/* Avatar + name */}
      <div className="surface border border-[var(--border)] rounded-xl p-5 text-center">
        <div className={`w-16 h-16 rounded-full ${avatarColor(fullName)} flex items-center justify-center mx-auto mb-3`}>
          <span className="text-white text-xl font-bold">{initials}</span>
        </div>
        <h2 className="text-lg font-semibold text-primary">{fullName}</h2>
        <p className="text-xs text-subtle mt-0.5">{lead.leadType.replace(/_/g, ' ')}</p>

        {/* Inline status change */}
        <div className="mt-3">
          <select
            value={lead.status}
            onChange={handleStatusChange}
            disabled={updatingStatus}
            className={`w-full text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 text-center appearance-none ${getStatusColor(lead.status)} disabled:opacity-60`}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onEditClick}
            className="flex-1 text-xs px-3 py-2 border border-[var(--border)] rounded-lg text-primary hover:opacity-70 transition-opacity font-medium"
          >
            Edit
          </button>
          {lead.status !== 'CONVERTED' && (
            <button
              onClick={async () => {
                setUpdatingStatus(true);
                try {
                  await leadsApi.updateLead(lead.id, { status: 'CONVERTED' });
                  onStatusChange('CONVERTED');
                } finally {
                  setUpdatingStatus(false);
                }
              }}
              disabled={updatingStatus}
              className="flex-1 text-xs px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
            >
              Convert
            </button>
          )}
          {lead.status !== 'LOST' && (
            <button
              onClick={async () => {
                setUpdatingStatus(true);
                try {
                  await leadsApi.updateLead(lead.id, { status: 'LOST' });
                  onStatusChange('LOST');
                } finally {
                  setUpdatingStatus(false);
                }
              }}
              disabled={updatingStatus}
              className="flex-1 text-xs px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
            >
              Lost
            </button>
          )}
        </div>
      </div>

      {/* Contact channels */}
      {lead.contacts && lead.contacts.length > 0 && (
        <div className="surface border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">Contact</p>
          <div className="space-y-2">
            {lead.contacts.map((c: ContactResponseDto) => (
              <div key={c.id} className={`flex items-center gap-2.5 ${c.doNotContact ? 'opacity-40' : ''}`}>
                <span className="text-base">{CONTACT_ICONS[c.type] ?? '📋'}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-primary truncate">{c.value}</p>
                  <p className="text-xs text-subtle">{c.type.toLowerCase()}{c.isPrimary ? ' · primary' : ''}{c.doNotContact ? ' · DNC' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned to */}
      <div className="surface border border-[var(--border)] rounded-xl p-4">
        <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-2">Assigned To</p>
        {canAssign ? (
          <select
            value={lead.assignedAgentId ?? ''}
            onChange={handleAssigneeChange}
            disabled={updatingAssignee}
            className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-primary cursor-pointer focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          >
            <option value="">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.email}</option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-primary font-medium">{assignedAgentEmail ?? 'Unassigned'}</p>
        )}
      </div>

      {/* Lead details */}
      <div className="surface border border-[var(--border)] rounded-xl p-4">
        <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-2">Details</p>
        <Field label="Source" value={lead.source} />
        <Field label="Campaign" value={lead.campaignId} />
        <Field label="Budget" value={lead.budgetRange} />
        <Field label="Coverage" value={lead.coverageAmount ? `$${lead.coverageAmount}` : null} />
        <Field label="Risk Profile" value={lead.riskProfile} />
        <Field label="UTM Source" value={lead.utmSource} />
        <Field label="UTM Medium" value={lead.utmMedium} />
        <Field label="UTM Campaign" value={lead.utmCampaign} />
        {(!lead.source && !lead.budgetRange && !lead.riskProfile) && (
          <p className="text-xs text-subtle py-1">No additional details</p>
        )}
      </div>
    </aside>
  );
}
