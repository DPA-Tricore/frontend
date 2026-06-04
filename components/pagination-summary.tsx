import { PaginationMeta } from '@/lib/types/common';

interface PaginationSummaryProps {
  meta: PaginationMeta;
  page: number;
  limit: number;
  label?: string;
}

export default function PaginationSummary({
  meta,
  page,
  limit,
  label = 'results',
}: PaginationSummaryProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, meta.total);

  return (
    <div className="mb-4 text-sm text-muted">
      Showing {from} to {to} of {meta.total} {label}
    </div>
  );
}
