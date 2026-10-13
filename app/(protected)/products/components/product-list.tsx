'use client';

import type { ProductResponseDto } from '@/lib/types/products';
import { BILLING_INTERVAL_SUFFIX } from '@/lib/constants/products';
import { formatCentsAsMoney } from '@/lib/utils/format';

interface ProductListProps {
  products: ProductResponseDto[];
  onSelect: (product: ProductResponseDto) => void;
}

export default function ProductList({ products, onSelect }: ProductListProps) {
  return (
    <div className="overflow-x-auto surface rounded-lg border border-[var(--border)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)] [background:var(--bg)]">
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Type</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-primary">Base Premium</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              onClick={() => onSelect(product)}
              className={`border-b border-[var(--border)] last:border-b-0 hover:[background:var(--bg)] cursor-pointer ${
                product.isActive ? '' : 'opacity-60'
              }`}
            >
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-primary">{product.name}</div>
                {product.description && (
                  <div className="text-xs text-muted mt-0.5 truncate max-w-md">{product.description}</div>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-muted">{product.productType || '—'}</td>
              <td className="px-6 py-4 text-sm text-primary text-right whitespace-nowrap tabular-nums">
                {formatCentsAsMoney(product.basePremiumCents)}
                <span className="text-muted"> / {BILLING_INTERVAL_SUFFIX[product.billingInterval]}</span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    product.isActive ? 'bg-green-500/15 text-green-600' : 'bg-gray-500/15 text-[var(--muted)]'
                  }`}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
