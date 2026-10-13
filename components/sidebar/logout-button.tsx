'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface LogoutButtonProps {
  iconOnly?: boolean;
}

export default function LogoutButton({ iconOnly = false }: LogoutButtonProps) {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      title="Log out"
      aria-label="Log out"
      className={`flex items-center gap-2 text-sm text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50 ${
        iconOnly ? 'p-1.5' : 'w-full px-3 py-2'
      }`}
    >
      <LogOut size={16} className="flex-shrink-0" />
      {!iconOnly && <span>{isLoading ? 'Logging out…' : 'Log out'}</span>}
    </button>
  );
}
