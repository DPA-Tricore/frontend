'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import PageHeader from '@/components/page-header';
import ProfileForm from './components/profile-form';

export default function ProfileSettingsPage() {
  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary mb-2">
          <ChevronLeft size={16} />
          Settings
        </Link>
        <PageHeader title="Profile" />

        <ProfileForm />
      </div>
    </div>
  );
}
