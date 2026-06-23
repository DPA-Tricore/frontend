'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface Props {
  isCollapsed: boolean;
}

export default function SidebarSearch({ isCollapsed }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/search')}
      title="Search"
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-muted interactive transition-colors ${
        isCollapsed ? 'justify-center' : ''
      }`}
    >
      <Search size={20} className="flex-shrink-0" />
      {!isCollapsed && (
        <span className="flex-1 flex items-center justify-between text-sm font-medium transition-opacity duration-300">
          <span>Search</span>
          <kbd className="text-xs font-mono bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded border border-[var(--border)]">
            ⌘K
          </kbd>
        </span>
      )}
    </button>
  );
}
