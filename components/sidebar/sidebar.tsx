'use client';

import { useEffect, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import SidebarNav from './sidebar-nav';
import SidebarUser from './sidebar-user';
import { APP_NAME } from '@/lib/constants/brand';
import { SIDEBAR_COLLAPSED_KEY } from '@/lib/constants/navigation';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      setIsCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true');
    } catch {
      // Storage blocked — start expanded.
    }
  }, []);

  const toggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
    } catch {
      // Not saved; the choice still holds for this visit.
    }
  };

  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      className={`flex-shrink-0 h-screen border-r border-[var(--border)] flex flex-col transition-[width] duration-200 ease-out overflow-hidden ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* The toggle is pinned to the right edge, centred in the collapsed width,
          so the fading app name can never push it out of view. */}
      <div className="relative h-[69px] flex-shrink-0 flex items-center pl-5 pr-14 border-b border-[var(--border)]">
        <span
          className={`min-w-0 truncate text-base font-semibold text-[var(--fg)] transition-opacity duration-200 ${
            isCollapsed ? 'opacity-0' : 'opacity-100 delay-75'
          }`}
        >
          {APP_NAME}
        </span>
        <button
          onClick={toggle}
          className="absolute right-[17px] top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ToggleIcon size={18} />
        </button>
      </div>

      <SidebarNav isCollapsed={isCollapsed} />
      <SidebarUser isCollapsed={isCollapsed} />
    </aside>
  );
}
