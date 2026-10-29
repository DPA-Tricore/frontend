'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import PageHeader from '@/components/page-header';
import BrowserAlertsCard from './components/browser-alerts-card';
import NotificationPreferencesList from './components/notification-preferences-list';

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary mb-2">
          <ChevronLeft size={16} />
          Settings
        </Link>
        <PageHeader title="Notifications" />

        <div className="space-y-6">
          <BrowserAlertsCard />
          <NotificationPreferencesList />
        </div>
      </div>
    </div>
  );
}
