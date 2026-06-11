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

  // Status Colors (for badges)
  status: {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    negotiation: 'bg-purple-100 text-purple-800',
    converted: 'bg-emerald-100 text-emerald-800',
    lost: 'bg-red-100 text-red-800',
    unresponsive: 'bg-gray-100 text-gray-800',
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
    URGENT: 'bg-red-100 text-red-800',
    HIGH: 'bg-orange-100 text-orange-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    LOW: 'bg-gray-100 text-gray-800',
  };
  return map[priority] ?? 'bg-gray-100 text-gray-800';
};

export const getTaskTypeColor = (type: string): string => {
  const map: Record<string, string> = {
    CALL: 'bg-purple-100 text-purple-800',
    EMAIL: 'bg-green-100 text-green-800',
    MEETING: 'bg-blue-100 text-blue-800',
    FOLLOW_UP: 'bg-yellow-100 text-yellow-800',
    CUSTOM: 'bg-gray-100 text-gray-800',
  };
  return map[type] ?? 'bg-gray-100 text-gray-800';
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

export const getScopeColor = (scope: string): string => {
  const map: Record<string, string> = {
    GLOBAL: 'bg-blue-100 text-blue-800',
    USER: 'bg-purple-100 text-purple-800',
  };
  return map[scope] ?? 'bg-gray-100 text-gray-800';
};
