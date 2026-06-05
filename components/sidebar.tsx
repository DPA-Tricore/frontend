'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import {
  TrendingUp,
  FileText,
  Zap,
  Users,
  Shield,
  BarChart3,
  Menu,
  LogOut,
  Settings,
  CheckSquare,
  Bell,
  Star,
} from 'lucide-react';

type MenuItem =
  | { name: string; icon: React.ElementType; href: string }
  | { name: string; icon: React.ElementType };

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    icon: BarChart3,
    href: '/dashboard',
  },
  {
    name: 'Leads',
    icon: TrendingUp,
    href: '/leads',
  },
  {
    name: 'Tasks',
    icon: CheckSquare,
    href: '/tasks',
  },
  {
    name: 'Reminders',
    icon: Bell,
    href: '/reminders',
  },
  {
    name: 'Reviews',
    icon: Star,
    href: '/reviews',
  },
  { name: 'Policies', icon: FileText },
  { name: 'Claims', icon: Zap },
  { name: 'Contacts', icon: Users },
  { name: 'Insurance', icon: Shield },
  { name: 'Reports', icon: BarChart3 },
  {
    name: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside
      className={`border-r border-[var(--border)] text-primary min-h-screen flex flex-col transition-all duration-300 overflow-hidden ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo/Header */}
      <div className="relative py-8 px-4 border-b border-primary flex items-center min-h-24">
        {/* Hamburger Button - Always Visible */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 interactive icon-btn"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <Menu size={24} />
        </button>

        {/* Logo/Title - Absolutely Positioned */}
        <div
          className={`absolute top-1/2 left-16 -translate-y-1/2 transition-opacity ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-300'
          }`}
        >
          <h1 className="text-2xl font-bold text-primary whitespace-nowrap">DPA</h1>
          <p className="text-sm text-muted">Insurance CRM</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = 'href' in item && pathname === item.href;
          const Icon = item.icon;
          const sharedClass = `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
            isActive ? 'bg-blue-600 text-white' : 'text-muted interactive'
          }`;
          const label = (
            <>
              <Icon size={20} className="flex-shrink-0" />
              <span
                className={`font-medium transition-opacity duration-300 ${
                  isCollapsed ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {item.name}
              </span>
            </>
          );
          return 'href' in item ? (
            <Link
              key={item.name}
              href={item.href}
              className={sharedClass}
              title={isCollapsed ? item.name : ''}
            >
              {label}
            </Link>
          ) : (
            <button
              key={item.name}
              type="button"
              className={sharedClass}
              title={isCollapsed ? item.name : ''}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4">
        <div
          className={`mb-4 px-4 py-3 surface rounded-lg transition-opacity duration-300 ${
            isCollapsed ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <p className="text-sm text-muted">Logged in as</p>
          <p className="text-sm font-medium truncate text-primary">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut size={16} />
          <span
            className={`transition-opacity duration-300 ${
              isCollapsed ? 'opacity-0' : 'opacity-100'
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
