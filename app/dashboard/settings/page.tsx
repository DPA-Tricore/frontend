'use client';

import { useTheme } from '@/context/theme-context';
import { Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your preferences and application settings
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Appearance Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Appearance
            </h2>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? (
                  <Moon size={24} className="text-yellow-500" />
                ) : (
                  <Sun size={24} className="text-orange-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {theme === 'dark'
                      ? 'Dark mode is enabled'
                      : 'Light mode is active'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={theme === 'dark'}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* More settings can be added here in the future */}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 <span className="font-medium">Tip:</span> Your preferences are saved
            automatically and will be restored when you return.
          </p>
        </div>
      </div>
    </div>
  );
}
