'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitMerge, TrendingUp, CheckSquare, Users } from 'lucide-react';

const tabs = [
  { label: 'Pipeline', href: '/reports/pipeline', icon: GitMerge },
  { label: 'Lead Trend', href: '/reports/trends', icon: TrendingUp },
  { label: 'Activity', href: '/reports/activity', icon: CheckSquare },
  { label: 'Agent Performance', href: '/reports/agents', icon: Users },
];

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Reports</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Track pipeline health, agent performance, and activity metrics.</p>
      </div>

      <div className="border-b border-[var(--border)] flex gap-1">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                  : 'border-transparent text-[var(--muted)] hover:text-primary'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
