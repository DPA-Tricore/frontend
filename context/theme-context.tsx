'use client';

import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { storageService } from '@/lib/services/storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  // Apply theme to DOM (runs before paint)
  useLayoutEffect(() => {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [theme]);

  // Restore theme preference on mount
  useEffect(() => {
    try {
      const savedTheme = storageService.getTheme();
      if (savedTheme) {
        setThemeState(savedTheme);
      } else {
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setThemeState('dark');
        }
      }
    } catch (error) {
      console.error('Failed to restore theme:', error);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    storageService.setTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
