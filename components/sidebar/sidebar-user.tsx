'use client';

import { useAuth } from '@/context/auth-context';
import LogoutButton from './logout-button';

interface SidebarUserProps {
  isCollapsed: boolean;
}

export default function SidebarUser({ isCollapsed }: SidebarUserProps) {
  const { user } = useAuth();

  return (
    <div className="px-4 py-4">
      <div
        className={`mb-4 px-4 py-3 surface rounded-lg transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <p className="text-sm text-muted">Logged in as</p>
        <p className="text-sm font-medium truncate text-primary">{user?.email}</p>
      </div>
      <LogoutButton isCollapsed={isCollapsed} />
    </div>
  );
}
