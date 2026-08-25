'use client';

import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { CustomerResponseDto } from '@/lib/api/customers';
import { useUpdateCustomerStatus } from '@/lib/hooks/use-customers';
import { useUsers } from '@/lib/hooks/use-users';
import { getCustomerStatusColor } from '@/lib/theme/colors';
import { formatDate } from '@/lib/utils/date';
import { AVATAR_COLORS } from '@/lib/constants/leads';

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const STATUSES = ['ACTIVE', 'INACTIVE', 'CHURNED'] as const;

interface CustomerHeroProps {
  customer: CustomerResponseDto;
}

export default function CustomerHero({ customer }: CustomerHeroProps) {
  const { data: users = [] } = useUsers();
  const updateStatus = useUpdateCustomerStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fullName = `${customer.firstName} ${customer.lastName}`;
  const initials = `${customer.firstName[0] ?? ''}${customer.lastName[0] ?? ''}`.toUpperCase();
  const ownerEmail = users.find((u) => u.id === customer.ownerId)?.email;

  const handleStatusChange = (status: string) => updateStatus.mutate({ id: customer.id, status });

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
      {/* Identity + actions */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-12 h-12 rounded-full ${avatarColor(fullName)} flex items-center justify-center shrink-0`}>
            <span className="text-white text-base font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-primary leading-tight truncate">{fullName}</h1>
            <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerStatusColor(customer.status)}`}>
              {customer.status}
            </span>
          </div>
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
              {STATUSES.filter((s) => s !== customer.status).map((status) => (
                <button
                  key={status}
                  onClick={() => { setMenuOpen(false); handleStatusChange(status); }}
                  disabled={updateStatus.isPending}
                  className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
                >
                  Mark {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{ownerEmail?.[0]?.toUpperCase() ?? '?'}</span>
          </div>
          <span className="text-subtle">{ownerEmail ?? 'Unassigned'}</span>
        </div>
        <span className="text-[var(--border)]">·</span>
        <span className="text-subtle">Customer since {formatDate(customer.createdAt)}</span>
      </div>
    </div>
  );
}
