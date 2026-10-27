'use client';

import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/context/theme-context';

/**
 * App-wide toasts, drawn with the app's surface colors so they follow dark mode.
 * Bottom-center keeps them clear of the AI chat button in the bottom-right corner.
 */
export default function Toaster() {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      position="bottom-center"
      style={
        {
          '--normal-bg': 'var(--surface)',
          '--normal-text': 'var(--fg)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
    />
  );
}
