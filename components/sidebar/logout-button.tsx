'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface LogoutButtonProps {
  isCollapsed?: boolean;
}

export default function LogoutButton({ isCollapsed = false }: LogoutButtonProps) {
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
      className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
    >
      <LogOut size={16} />
      <span
        className={`transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </span>
    </button>
  );
}
