'use client';

import { useTheme } from '@/context/theme-context';
import Link from 'next/link';
import { Bell, ChevronRight, Moon, Sun, UserRound } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { useMe } from '@/lib/hooks/use-me';
import { NOTIFICATION_SETTINGS_PATH } from '@/lib/constants/notifications';
import { PROFILE_SETTINGS_PATH } from '@/lib/constants/profile';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data: me } = useMe();
  const hasNoName = !!me && !me.firstName && !me.lastName;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Settings" />

        {/* Settings Card */}
        <div className="surface rounded-xl border border-[var(--border)] shadow-sm divide-y divide-[var(--border)]">
          {/* Account Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-6">
              Account
            </h2>

            <Link href={PROFILE_SETTINGS_PATH} className="group flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <UserRound size={24} className="text-blue-500" />
                <div>
                  <p className="font-medium text-primary">
                    Profile
                  </p>
                  <p className="text-sm text-muted">
                    {hasNoName
                      ? "Add your name so clients know who they're hearing from"
                      : 'Your name on tasks, leads and client emails'}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted group-hover:text-primary" />
            </Link>
          </div>

          {/* Notifications Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-6">
              Notifications
            </h2>

            <Link href={NOTIFICATION_SETTINGS_PATH} className="group flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Bell size={24} className="text-blue-500" />
                <div>
                  <p className="font-medium text-primary">
                    Notification settings
                  </p>
                  <p className="text-sm text-muted">
                    Pick what you get told about, and turn on browser alerts
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted group-hover:text-primary" />
            </Link>
          </div>

          {/* Appearance Section */}
          <div className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-6">
              Appearance
            </h2>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? (
                  <Moon size={24} className="text-yellow-500" />
                ) : (
                  <Sun size={24} className="text-orange-500" />
                )}
                <div>
                  <p className="font-medium text-primary">
                    Dark Mode
                  </p>
                  <p className="text-sm text-muted">
                    {theme === 'dark'
                      ? 'Dark mode is enabled'
                      : 'Light mode is active'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={theme === 'dark'}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* More settings can be added here in the future */}
        </div>

        {/* Info Box */}
        <div className="callout mt-6 p-4 rounded-lg">
          <p className="text-sm">
            💡 <span className="font-medium">Tip:</span> Your preferences are saved
            automatically and will be restored when you return.
          </p>
        </div>
      </div>
    </div>
  );
}
