import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { TaskLeadSummary } from '@/lib/types/tasks';
import { getStatusColor } from '@/lib/theme/colors';
import { contactHref } from '@/lib/utils/contact-links';
import { CONTACT_ICONS } from '@/lib/constants/leads';

interface TaskRelatedLeadProps {
  lead: TaskLeadSummary;
}

/** The person this task is about, with one-click contact links so a call/email task can be done from here. */
export default function TaskRelatedLead({ lead }: TaskRelatedLeadProps) {
  const fullName = `${lead.firstName} ${lead.lastName}`;
  const initials = `${lead.firstName[0] ?? ''}${lead.lastName[0] ?? ''}`.toUpperCase();
  const reachable = lead.contacts.filter((c) => contactHref(c)).slice(0, 3);

  return (
    <div className="surface border border-[var(--border)] rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap">
      <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 min-w-0 flex-1 group">
        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-subtle">Related lead</p>
          <p className="text-sm font-medium text-primary truncate group-hover:underline">{fullName}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getStatusColor(lead.status)}`}>
          {lead.status.replace(/_/g, ' ')}
        </span>
        <ChevronRight size={16} className="text-subtle shrink-0" />
      </Link>

      {reachable.length > 0 && (
        <div className="flex items-center gap-2">
          {reachable.map((c) => {
            const Icon = CONTACT_ICONS[c.type];
            const href = contactHref(c)!;
            const external = href.startsWith('http');
            return (
              <a
                key={c.id}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                title={c.value}
                className="flex items-center gap-1.5 text-xs font-medium text-primary border border-[var(--border)] px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <Icon size={13} />
                <span className="max-w-[160px] truncate">{c.value}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
