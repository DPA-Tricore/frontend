'use client';

import { CustomerResponseDto } from '@/lib/api/customers';
import { useAuth } from '@/context/auth-context';
import { useAssignCustomer } from '@/lib/hooks/use-customers';
import { useUsers } from '@/lib/hooks/use-users';
import { userDisplayName } from '@/lib/utils/user-name';
import { ASSIGNABLE_ROLES, CAN_ASSIGN_ROLES } from '@/lib/constants/leads';
import ContactsSection from '@/components/contacts/contacts-section';

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
      <ContactsSection owner={{ type: 'customer', id: customer.id }} contacts={customer.contacts ?? []} />
      <div className="border-b border-[var(--border)] my-4" />

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
