/**
 * The "Fire immediately (demo mode)" option on reminder pickers. Hidden from real users:
 * it shows in local dev, or on a deploy with NEXT_PUBLIC_SHOW_DEMO_MODE=true (for demos).
 */
export const SHOW_REMINDER_DEMO_MODE =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_DEMO_MODE === 'true';
