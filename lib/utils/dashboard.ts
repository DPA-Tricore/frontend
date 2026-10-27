export function getDisplayNameFromEmail(email?: string | null): string {
  if (!email) return 'User';
  const raw = email.split('@')[0] || 'User';
  return raw
    .split(/[\W_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}
