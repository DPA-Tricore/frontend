'use client';

import { Activity as ActivityIcon } from 'lucide-react';
import { useCustomerActivity } from '@/lib/hooks/use-customer-detail';
import { formatDate, formatTime } from '@/lib/utils/date';
import EmptyState from '@/components/empty-state';

interface CustomerActivityTabProps {
  customerId: string;
}

export default function CustomerActivityTab({ customerId }: CustomerActivityTabProps) {
  const { data: activities = [], isLoading } = useCustomerActivity(customerId);

  if (isLoading) return <p className="text-sm text-subtle">Loading activity...</p>;

  if (activities.length === 0) {
    return <EmptyState message="No activity yet" icon={<ActivityIcon size={32} className="mx-auto text-subtle" />} />;
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--border)]" />

      <div className="space-y-0">
        {activities.map((activity) => (
          <div key={activity.id} className="relative flex gap-4 pb-6">
            <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <ActivityIcon size={14} />
            </div>
            <div className="flex-1 pt-1 min-w-0">
              <span className="text-sm font-medium text-primary">{activity.message ?? activity.action}</span>
              <p className="text-xs text-subtle mt-1">{formatDate(activity.createdAt)} · {formatTime(activity.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
