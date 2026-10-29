export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

export function getTimeLeft(date: Date | string): string {
  const diff = new Date(date).getTime() - Date.now();
  if (diff < 0) return 'Overdue';
  if (diff < 60_000) return 'In a few seconds';
  if (diff < 3_600_000) return `In ${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `In ${Math.floor(diff / 3_600_000)}h`;
  return `In ${Math.floor(diff / 86_400_000)}d`;
}

/** "just now", "5m", "3h", "2d", then the date — for the bell. */
export function formatTimeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
