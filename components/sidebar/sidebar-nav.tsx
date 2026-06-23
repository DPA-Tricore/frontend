'use client';

import { usePathname } from 'next/navigation';
import SidebarItem from './sidebar-item';
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
} from 'lucide-react';
import React from 'react';

type MenuItem =
  | { name: string; icon: React.ElementType; href: string }
  | { name: string; icon: React.ElementType };

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: BarChart3, href: '/dashboard' },
  { name: 'Leads', icon: TrendingUp, href: '/leads' },
  { name: 'Tasks', icon: CheckSquare, href: '/tasks' },
  { name: 'Reminders', icon: Bell, href: '/reminders' },
  { name: 'Reviews', icon: Star, href: '/reviews' },
  { name: 'Automations', icon: GitBranch, href: '/automations' },
  { name: 'Documents', icon: Paperclip, href: '/documents' },
  { name: 'Reports', icon: FileBarChart, href: '/reports' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

interface SidebarNavProps {
  isCollapsed: boolean;
}

export default function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {menuItems.map((item) => {
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
