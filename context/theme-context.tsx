'use client';

import React, { createContext, useContext, useLayoutEffect, useSyncExternalStore } from 'react';
import { storageService } from '@/lib/services/storage';
import { DARK_SCHEME_QUERY, THEME_CHANGE_EVENT } from '@/lib/constants/theme';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Holds the choice for this visit when storage is blocked.
let unsavedTheme: Theme | null = null;

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DARK_SCHEME_QUERY);
  window.addEventListener('storage', onChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  media.addEventListener('change', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    media.removeEventListener('change', onChange);
  };
}

// The saved choice wins; with none saved, follow the system setting.
function getTheme(): Theme {
  return storageService.getTheme() ?? unsavedTheme ?? (window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light');
}

// The server can't see storage, so it renders light and the browser switches after hydrating.
function getServerTheme(): Theme {
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  // Apply theme to DOM (runs before paint)
  useLayoutEffect(() => {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    unsavedTheme = newTheme;
    storageService.setTheme(newTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
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
