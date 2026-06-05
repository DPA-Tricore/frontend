import type { LeadResponseDto } from '@/lib/api/leads';

export type LeadLike = Omit<LeadResponseDto, 'createdAt'> & {
  createdAt: string | Date;
  convertedAt?: string | Date | null;
  coverageAmount?: unknown;
};

export function toCoverageAmount(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === 'object' && value && 'toNumber' in value) {
    const n = (value as any).toNumber?.();
    return typeof n === 'number' && Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function safeDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

export function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
}

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
