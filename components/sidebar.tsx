'use client';

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
  ChevronLeft,
  LogOut,
} from 'lucide-react';

const menuItems = [
  {
    name: 'Leads',
    icon: TrendingUp,
    href: '/dashboard/leads',
  },
  {
    name: 'Policies',
    icon: FileText,
    href: '/dashboard/policies',
  },
  {
    name: 'Claims',
    icon: Zap,
    href: '/dashboard/claims',
  },
  {
    name: 'Contacts',
    icon: Users,
    href: '/dashboard/contacts',
  },
  {
    name: 'Insurance',
    icon: Shield,
    href: '/dashboard/insurance',
  },
  {
    name: 'Reports',
    icon: BarChart3,
    href: '/dashboard/reports',
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
      className={`bg-white border-r border-gray-200 text-gray-900 min-h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo/Header */}
      <div className="px-6 py-8 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <>
            <div>
              <h1 className="text-2xl font-bold">DPA</h1>
              <p className="text-sm text-gray-500 mt-1">Insurance CRM</p>
            </div>
          </>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronLeft
            size={24}
            className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-4 px-4 py-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
