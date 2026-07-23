/**
 * Global Color Palette - Apple-like Design System
 * Reusable across the entire application
 */

export const colors = {
  // Primary (Dark Charcoal - Apple-like)
  primary: {
    base: 'bg-gray-900',
    hover: 'hover:bg-gray-800',
    text: 'text-gray-900',
    textHover: 'hover:text-gray-700',
    light: 'bg-gray-800',
    lightHover: 'hover:bg-gray-700',
  },

  // Secondary (Neutral Grays)
  secondary: {
    light: 'bg-gray-50',
    hover: 'hover:bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-600',
    textDark: 'text-gray-700',
  },

  // Interactive States
  button: {
    primary: 'px-6 py-2 border border-[var(--border)] text-primary rounded-lg interactive transition-colors shadow-sm font-medium',
    secondary: 'px-6 py-2 border border-[var(--border)] text-primary rounded-lg interactive transition-colors',
    text: 'text-sm text-primary font-medium transition-colors interactive',
  },

  // Status Colors (for badges) — opacity-based so they work in both light and dark mode
  status: {
    new: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    contacted: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    qualified: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    negotiation: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    converted: 'bg-teal-500/15 text-teal-700 dark:text-teal-400',
    lost: 'bg-red-500/15 text-red-600 dark:text-red-400',
    unresponsive: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  },

  // Pagination
  pagination: {
    active: 'px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white',
    inactive: 'px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-primary hover:opacity-70',
    button: 'px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-primary hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed',
  },

  // Text
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    white: 'text-white',
  },

  // Background
  background: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    dark: 'bg-gray-900',
  },

  // Border
  border: {
    light: 'border-gray-200',
    default: 'border-gray-300',
    dark: 'border-gray-400',
  },
};

/**
 * Helper function to combine multiple color classes
 */
export const combineColors = (...colorClasses: (string | undefined)[]): string => {
  return colorClasses.filter(Boolean).join(' ');
};

/**
 * Get status color by status value
 */
export const getPriorityColor = (priority: string): string => {
  const map: Record<string, string> = {
    URGENT: 'bg-red-500/15 text-red-600 dark:text-red-400',
    HIGH: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    MEDIUM: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    LOW: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  };
  return map[priority] ?? 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
};

export const getTaskTypeColor = (type: string): string => {
  const map: Record<string, string> = {
    CALL: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    EMAIL: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    MEETING: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    FOLLOW_UP: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    CUSTOM: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  };
  return map[type] ?? 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
};

export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    NEW: colors.status.new,
    CONTACTED: colors.status.contacted,
    QUALIFIED: colors.status.qualified,
    IN_NEGOTIATION: colors.status.negotiation,
    CONVERTED: colors.status.converted,
    LOST: colors.status.lost,
    UNRESPONSIVE: colors.status.unresponsive,
  };
  return statusMap[status] || colors.status.unresponsive;
};

export const getReminderStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
    TRIGGERED: 'bg-red-500/15 text-red-600 dark:text-red-400',
    ACKNOWLEDGED: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    DISMISSED: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
    CANCELLED: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  };
  return map[status] ?? map.DISMISSED;
};

export const getScopeColor = (scope: string): string => {
  const map: Record<string, string> = {
    GLOBAL: 'bg-blue-100 text-blue-800',
    USER: 'bg-purple-100 text-purple-800',
  };
  return map[scope] ?? 'bg-gray-100 text-gray-800';
};
