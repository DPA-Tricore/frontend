'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const menuItems = [
  {
    name: 'Leads',
    icon: '📊',
    href: '/dashboard/leads',
  },
  {
    name: 'Policies',
    icon: '📋',
    href: '/dashboard/policies',
  },
  {
    name: 'Claims',
    icon: '⚙️',
    href: '/dashboard/claims',
  },
  {
    name: 'Contacts',
    icon: '👥',
    href: '/dashboard/contacts',
  },
  {
    name: 'Insurance',
    icon: '🛡️',
    href: '/dashboard/insurance',
  },
  {
    name: 'Reports',
    icon: '📈',
    href: '/dashboard/reports',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-gray-800">
        <h1 className="text-2xl font-bold">DPA</h1>
        <p className="text-sm text-gray-400 mt-1">Insurance CRM</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="mb-4 px-4 py-3 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400">Logged in as</p>
          <p className="text-sm font-medium truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
