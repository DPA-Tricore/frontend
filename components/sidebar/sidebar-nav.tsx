'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SidebarItem from './sidebar-item';
import { useAuth } from '@/context/auth-context';
import { NAV_GROUPS, SIDEBAR_FOLDED_GROUPS_KEY } from '@/lib/constants/navigation';

interface SidebarNavProps {
  isCollapsed: boolean;
}

export default function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [folded, setFolded] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_FOLDED_GROUPS_KEY);
      if (saved) setFolded(JSON.parse(saved));
    } catch {
      // Storage blocked or corrupt — every group starts open.
    }
  }, []);

  const toggleGroup = (label: string) => {
    const next = folded.includes(label) ? folded.filter((l) => l !== label) : [...folded, label];
    setFolded(next);
    try {
      localStorage.setItem(SIDEBAR_FOLDED_GROUPS_KEY, JSON.stringify(next));
    } catch {
      // Not saved; the choice still holds for this visit.
    }
  };

  const canSee = (roles?: string[]) => !roles || (!!user?.role && roles.includes(user.role));

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {NAV_GROUPS.filter((group) => canSee(group.roles)).map((group, index) => {
        const items = group.items.filter((item) => canSee(item.roles));
        if (items.length === 0) return null;

        // A folded group stays open while you're on one of its pages, so the
        // current page never disappears from the menu.
        const hasActive = items.some((item) => isActive(item.href));
        const isFolded = !!group.label && folded.includes(group.label) && !hasActive && !isCollapsed;

        return (
          <div key={group.label ?? index}>
            {group.label && (
              <div className="relative mb-1 h-5">
                <div
                  className={`absolute inset-x-2 top-1/2 border-t border-[var(--border)] transition-opacity duration-200 ${
                    isCollapsed ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label!)}
                  aria-expanded={!isFolded}
                  tabIndex={isCollapsed ? -1 : 0}
                  className={`group flex w-full h-full items-center justify-between px-3 text-xs font-medium whitespace-nowrap text-[var(--subtle)] hover:text-[var(--muted)] transition-opacity duration-200 ${
                    isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-75'
                  }`}
                >
                  {group.label}
                  <ChevronDown
                    size={14}
                    className={`opacity-0 group-hover:opacity-100 transition duration-200 ${isFolded ? '-rotate-90' : ''}`}
                  />
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {!isFolded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5">
                    {items.map((item) => (
                      <SidebarItem
                        key={item.href}
                        name={item.name}
                        icon={item.icon}
                        href={item.href}
                        isActive={isActive(item.href)}
                        isCollapsed={isCollapsed}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
