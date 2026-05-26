'use client';

import { Bell } from 'lucide-react';
import { useReminders } from '@/lib/hooks/use-reminders';
import { useState } from 'react';
import NotificationCenter from './notification-center';

export default function NotificationBadge() {
  const { pendingCount } = useReminders();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 icon-btn interactive"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {pendingCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
        )}
      </button>

      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
