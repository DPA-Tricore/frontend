'use client';

import { Fragment, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Transition } from '@headlessui/react';
import { Bell, CheckCheck, Settings, X } from 'lucide-react';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationList,
  useUnreadNotificationCount,
} from '@/lib/hooks/use-notifications';
import { NOTIFICATION_SETTINGS_PATH, NOTIFICATION_TYPE_ICONS } from '@/lib/constants/notifications';
import { formatTimeAgo } from '@/lib/utils/date';
import type { AppNotification } from '@/lib/types/notifications';
import LoadingSpinner from './loading-spinner';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

/** The bell's panel: the signed-in user's own notifications, newest first. */
export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const router = useRouter();
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useNotificationList(isOpen);
  const { data: unread } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];
  const unreadCount = unread?.count ?? 0;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const open = (notification: AppNotification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    onClose();
    if (notification.link) router.push(notification.link);
  };

  return (
    <Transition show={isOpen} as={Fragment}>
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Click-outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer */}
      <Transition.Child
        as={Fragment}
        enter="transform transition ease-in-out duration-500"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition ease-in-out duration-300"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
      <div
        role="dialog"
        aria-label="Notifications"
        className="absolute right-0 top-0 bottom-0 w-full max-w-md surface shadow-lg flex flex-col"
      >
        <div className="flex-shrink-0 border-b border-[var(--border)] px-4 py-3 flex items-center gap-2">
          <h2 className="text-xl font-semibold text-primary flex-1">
            Notifications
          </h2>
          <button
            onClick={() => markAllRead.mutate()}
            disabled={unreadCount === 0 || markAllRead.isPending}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-muted hover:text-primary interactive disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
          <Link
            href={NOTIFICATION_SETTINGS_PATH}
            onClick={onClose}
            className="p-1.5 rounded-md text-muted hover:text-primary interactive"
            aria-label="Notification settings"
            title="Notification settings"
          >
            <Settings size={18} />
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted hover:text-primary interactive"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <LoadingSpinner />
          ) : isError ? (
            <p className="text-center text-sm text-muted py-12 px-6">
              Couldn&apos;t load your notifications. Close this and try again.
            </p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Bell className="w-10 h-10 text-subtle mx-auto mb-3" />
              <p className="text-muted">No notifications</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {notifications.map((notification) => (
                <NotificationRow key={notification.id} notification={notification} onOpen={open} />
              ))}
            </ul>
          )}

          {hasNextPage && (
            <div className="p-4 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-sm font-medium text-muted hover:text-primary interactive disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Loading…' : 'Show older'}
              </button>
            </div>
          )}
        </div>
      </div>
      </Transition.Child>
    </div>
    </Transition>
  );
}

interface NotificationRowProps {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
}

function NotificationRow({ notification, onOpen }: NotificationRowProps) {
  const Icon = NOTIFICATION_TYPE_ICONS[notification.type] ?? Bell;
  const unread = !notification.readAt;

  return (
    <li>
      <button
        onClick={() => onOpen(notification)}
        className={`w-full text-left flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)] ${
          unread ? 'bg-blue-500/5' : ''
        }`}
      >
        <span className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center bg-[var(--surface-2)] text-muted">
          <Icon size={16} />
        </span>
        <span className="flex-1 min-w-0">
          <span className={`block text-sm text-primary ${unread ? 'font-semibold' : ''}`}>
            {notification.title}
          </span>
          {notification.body && (
            <span className="block text-sm text-muted line-clamp-2">{notification.body}</span>
          )}
          <span className="block text-xs text-subtle mt-1">{formatTimeAgo(notification.createdAt)}</span>
        </span>
        {unread && (
          <span className="flex-shrink-0 mt-2 w-2 h-2 rounded-full bg-blue-500">
            <span className="sr-only">Unread</span>
          </span>
        )}
      </button>
    </li>
  );
}
