'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useUnreadNotificationCount } from '@/lib/hooks/use-notifications';
import { useBrowserAlertsSync } from '@/lib/hooks/use-browser-alerts-sync';
import NotificationCenter from './notification-center';

export default function NotificationBadge() {
  const { data } = useUnreadNotificationCount();
  const [isOpen, setIsOpen] = useState(false);
  useBrowserAlertsSync();

  const count = data?.count ?? 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 icon-btn interactive"
        aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
