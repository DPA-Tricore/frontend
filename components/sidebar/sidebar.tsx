'use client';

import { useEffect, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SidebarNav from './sidebar-nav';
import SidebarUser from './sidebar-user';
import { APP_NAME } from '@/lib/constants/brand';
import { DESKTOP_NAV_MEDIA_QUERY, SIDEBAR_COLLAPSED_KEY } from '@/lib/constants/navigation';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    // Storage blocked — start expanded.
    return false;
  }
}

// On desktop the sidebar sits beside the page and can collapse to icons.
// Below the `md` breakpoint it's a drawer that slides over the page instead.
export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  // Only mounted once auth has loaded on the client, so reading storage here can't break hydration.
  const [isCollapsed, setIsCollapsed] = useState(readCollapsed);

  useEffect(() => {
    if (!isMobileOpen) return;
    const desktop = window.matchMedia(DESKTOP_NAV_MEDIA_QUERY);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose();
    };
    // Widening the window past the breakpoint hands over to the desktop sidebar.
    const onResize = (e: MediaQueryListEvent) => {
      if (e.matches) onMobileClose();
    };
    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onResize);
    };
  }, [isMobileOpen, onMobileClose]);

  const toggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
    } catch {
      // Not saved; the choice still holds for this visit.
    }
  };

  // The drawer always shows labels, whatever the desktop collapse setting is.
  const showCollapsed = isCollapsed && !isMobileOpen;
  const ToggleIcon = showCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onMobileClose}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Any link tapped in the drawer navigates away, so close it on the way. */}
      <aside
        onClick={(e) => {
          if (isMobileOpen && (e.target as HTMLElement).closest('a')) onMobileClose();
        }}
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-xl transition-[translate,visibility] md:static md:z-auto md:shadow-none md:visible md:translate-x-0 md:transition-[width] flex-shrink-0 h-screen bg-[var(--bg)] border-r border-[var(--border)] flex flex-col duration-200 ease-out overflow-hidden ${
          isMobileOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
        } ${isCollapsed ? 'md:w-16' : 'md:w-60'}`}
      >
        {/* The toggle is pinned to the right edge, centred in the collapsed width,
            so the fading app name can never push it out of view. */}
        <div className="relative h-[69px] flex-shrink-0 flex items-center pl-5 pr-14 border-b border-[var(--border)]">
          <span
            className={`min-w-0 truncate text-base font-semibold text-[var(--fg)] transition-opacity duration-200 ${
              showCollapsed ? 'opacity-0' : 'opacity-100 delay-75'
            }`}
          >
            {APP_NAME}
          </span>
          <button
            onClick={toggle}
            className="hidden md:block absolute right-[17px] top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
            title={showCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={showCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ToggleIcon size={18} />
          </button>
          <button
            onClick={onMobileClose}
            className="md:hidden absolute right-[17px] top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <SidebarNav isCollapsed={showCollapsed} />
        <SidebarUser isCollapsed={showCollapsed} />
      </aside>
    </>
  );
}
