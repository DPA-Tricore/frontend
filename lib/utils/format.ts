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
