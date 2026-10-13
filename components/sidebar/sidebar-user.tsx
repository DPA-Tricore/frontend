'use client';

import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import SidebarItem from './sidebar-item';
import LogoutButton from './logout-button';

interface SidebarUserProps {
  isCollapsed: boolean;
}

export default function SidebarUser({ isCollapsed }: SidebarUserProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <div className="px-3 py-3 border-t border-[var(--border)] space-y-1">
      <SidebarItem
        name="Settings"
        icon={Settings}
        href="/settings"
        isActive={pathname === '/settings' || pathname.startsWith('/settings/')}
        isCollapsed={isCollapsed}
      />

      <div className="flex items-center gap-2 h-10 px-1.5 whitespace-nowrap">
        <div
          className="w-7 h-7 flex-shrink-0 rounded-full bg-[var(--accent)] flex items-center justify-center"
          title={isCollapsed ? user?.email : undefined}
        >
          <span className="text-white font-semibold text-xs">{user?.email?.charAt(0).toUpperCase()}</span>
        </div>
        <div
          className={`flex flex-1 min-w-0 items-center gap-2 transition-opacity duration-200 ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-75'
          }`}
        >
          <p className="flex-1 min-w-0 text-sm truncate text-[var(--fg)]">{user?.email}</p>
          <LogoutButton iconOnly />
        </div>
      </div>

      {/* No room beside the avatar when collapsed, so log out drops below it. */}
      <AnimatePresence initial={false}>
        {isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden pl-1.5"
          >
            <LogoutButton iconOnly />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
