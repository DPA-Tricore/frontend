export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

// formatMoney rounds to whole dollars — fine for dashboard charts, wrong for
// an actual invoice amount. This one keeps cents precision and takes cents
// as input, matching how billing amounts are stored (amountCents).
export function formatCentsAsMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

// Parses a typed dollar amount ("120", "120.5") into whole cents. Null when
// it isn't a valid non-negative number.
export function parseDollarsToCents(value: string): number | null {
  const amount = parseFloat(value);
  if (Number.isNaN(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

/** 2048 → "2.0 KB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
