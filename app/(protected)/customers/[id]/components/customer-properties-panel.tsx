'use client';

import { CustomerResponseDto } from '@/lib/api/customers';
import type { ContactResponseDto } from '@/lib/types/leads';
import { useAuth } from '@/context/auth-context';
import { useAssignCustomer } from '@/lib/hooks/use-customers';
import { useUsers } from '@/lib/hooks/use-users';
import { userDisplayName } from '@/lib/utils/user-name';
import { contactHref } from '@/lib/utils/contact-links';
import { CONTACT_ICONS, ASSIGNABLE_ROLES, CAN_ASSIGN_ROLES } from '@/lib/constants/leads';

interface CustomerPropertiesPanelProps {
  customer: CustomerResponseDto;
}

export default function CustomerPropertiesPanel({ customer }: CustomerPropertiesPanelProps) {
  const { user } = useAuth();
  const { data: users = [] } = useUsers();
  const agents = users.filter((u) => u.isActive && ASSIGNABLE_ROLES.includes(u.role));
  const assignCustomer = useAssignCustomer();
  const canAssign = !!user?.role && CAN_ASSIGN_ROLES.includes(user.role);
  const owner = agents.find((a) => a.id === customer.ownerId);
  const ownerName = owner ? userDisplayName(owner) : undefined;

  const handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    assignCustomer.mutate({ id: customer.id, ownerId: e.target.value || null });
  };

  return (
    <aside className="surface border border-[var(--border)] rounded-xl p-5 space-y-0">
      {/* Contact */}
      {customer.contacts && customer.contacts.length > 0 && (
        <>
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-2">Contact</p>
          <div className="space-y-1 mb-1">
            {customer.contacts.map((c: ContactResponseDto) => {
              const Icon = CONTACT_ICONS[c.type];
              const href = contactHref(c);
              const content = (
                <>
                  <span className="w-7 h-7 rounded-full bg-gray-500/10 flex items-center justify-center shrink-0 text-subtle">
                    <Icon size={13} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-primary truncate">{c.value}</span>
                    <span className="block text-xs text-subtle">
                      {c.type.toLowerCase()}
                      {c.isPrimary ? ' · primary' : ''}
                      {c.doNotContact ? ' · DNC' : ''}
                    </span>
                  </span>
                </>
              );
              return href ? (
                <a
                  key={c.id}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 -mx-1.5 px-1.5 transition-colors"
                >
                  {content}
                </a>
              ) : (
                <div key={c.id} className={`flex items-center gap-2.5 py-1.5 ${c.doNotContact ? 'opacity-40' : ''}`}>
                  {content}
                </div>
              );
            })}
          </div>
          <div className="border-b border-[var(--border)] my-4" />
        </>
      )}

      {/* Assigned to */}
      <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-2">Account Owner</p>
      {canAssign ? (
        <select
          value={customer.ownerId ?? ''}
          onChange={handleOwnerChange}
          disabled={assignCustomer.isPending}
          className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-primary cursor-pointer focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        >
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{userDisplayName(a)}</option>
          ))}
        </select>
      ) : (
        <p className="text-xs text-primary font-medium">{ownerName ?? 'Unassigned'}</p>
      )}

      <div className="border-b border-[var(--border)] my-4" />
      <p className="text-xs text-subtle font-mono break-all">{customer.id}</p>
    </aside>
  );
}
