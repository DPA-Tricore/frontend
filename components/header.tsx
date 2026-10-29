'use client';

import NotificationBadge from '@/components/notification-badge';
import { useAuth } from '@/context/auth-context';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '@/context/theme-context';
import NavbarSearch from '@/components/search/NavbarSearch';

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
  onSearchOpen?: () => void;
}

export default function Header({ onMenuClick, title, onSearchOpen }: HeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-primary">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Phone width only: the sidebar is a drawer there. */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 -ml-2 interactive icon-btn"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          )}

          {title && (
            <h1 className="text-2xl font-semibold text-primary">
              {title}
            </h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          {onSearchOpen && <NavbarSearch onOpen={onSearchOpen} />}

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
