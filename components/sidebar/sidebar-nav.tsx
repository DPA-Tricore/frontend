'use client';

import { usePathname } from 'next/navigation';
import SidebarItem from './sidebar-item';
import { useAuth } from '@/context/auth-context';
import {
  BarChart3,
  TrendingUp,
  CheckSquare,
  Bell,
  Star,
  GitBranch,
  Paperclip,
  Settings,
  FileBarChart,
  Search,
  Users,
} from 'lucide-react';
import React from 'react';

type MenuItem =
  | { name: string; icon: React.ElementType; href: string; minRole?: string[] }
  | { name: string; icon: React.ElementType; minRole?: string[] };

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: BarChart3, href: '/dashboard' },
  { name: 'Search', icon: Search, href: '/search' },
  { name: 'Leads', icon: TrendingUp, href: '/leads' },
  { name: 'Tasks', icon: CheckSquare, href: '/tasks' },
  { name: 'Reminders', icon: Bell, href: '/reminders' },
  { name: 'Reviews', icon: Star, href: '/reviews' },
  { name: 'Automations', icon: GitBranch, href: '/automations' },
  { name: 'Documents', icon: Paperclip, href: '/documents' },
  { name: 'Reports', icon: FileBarChart, href: '/reports' },
  { name: 'Team', icon: Users, href: '/team', minRole: ['ORG_ADMIN'] },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

interface SidebarNavProps {
  isCollapsed: boolean;
}

export default function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const visibleItems = menuItems.filter(
    (item) => !item.minRole || (user?.role && item.minRole.includes(user.role)),
  );

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {visibleItems.map((item) => {
        const isActive =
          'href' in item &&
          (pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')));

        return (
          <SidebarItem
            key={item.name}
            name={item.name}
            icon={item.icon}
            href={'href' in item ? item.href : undefined}
            isActive={isActive}
            isCollapsed={isCollapsed}
          />
        );
      })}
    </nav>
  );
}
