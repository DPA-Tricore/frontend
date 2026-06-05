'use client';

interface ReviewFiltersProps {
  sortValue: string;
  ratingFilter: number | undefined;
  onSortChange: (value: string) => void;
  onRatingFilter: (value: number | undefined) => void;
}

export default function ReviewFilters({
  sortValue,
  ratingFilter,
  onSortChange,
  onRatingFilter,
}: ReviewFiltersProps) {
  return (
    <div className="mb-6 surface rounded-lg border border-[var(--border)] p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        >
          <option value="publishedAt-desc">Newest first</option>
          <option value="publishedAt-asc">Oldest first</option>
          <option value="rating-desc">Highest rating</option>
          <option value="rating-asc">Lowest rating</option>
        </select>

        <select
          value={ratingFilter ?? ''}
          onChange={(e) => onRatingFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        >
          <option value="">All ratings</option>
          <option value="5">★★★★★ 5 stars</option>
          <option value="4">★★★★☆ 4 stars</option>
          <option value="3">★★★☆☆ 3 stars</option>
          <option value="2">★★☆☆☆ 2 stars</option>
          <option value="1">★☆☆☆☆ 1 star</option>
        </select>
      </div>
    </div>
  );
}
