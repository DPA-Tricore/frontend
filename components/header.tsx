'use client';

import NotificationBadge from '@/components/notification-badge';
import { useAuth } from '@/context/auth-context';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-primary">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          
          {title && (
            <h1 className="text-2xl font-semibold text-primary">
              {title}
            </h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notification Badge */}
          <NotificationBadge />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 interactive icon-btn"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
