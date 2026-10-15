'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { colors } from '@/lib/theme/colors';
import type { ProductResponseDto } from '@/lib/types/products';
import { PRODUCT_MANAGER_ROLES } from '@/lib/constants/products';
import { useProducts } from '@/lib/hooks/use-products';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import ProductList from './components/product-list';
import ProductFormModal from './components/product-form-modal';

export default function ProductsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const canManage = !!user?.role && PRODUCT_MANAGER_ROLES.includes(user.role);

  const [showInactive, setShowInactive] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<ProductResponseDto | null>(null);

  const { data: products = [], isLoading, isError } = useProducts(showInactive);

  useEffect(() => {
    if (!isAuthLoading && !canManage) router.replace('/dashboard');
  }, [isAuthLoading, canManage, router]);

  if (isAuthLoading || !canManage) return <LoadingSpinner fullPage />;

  const openForm = (product: ProductResponseDto | null) => {
    setSelected(product);
    setIsFormOpen(true);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Products"
        error={isError ? 'Failed to fetch products' : null}
        actions={
          <button onClick={() => openForm(null)} className={colors.button.primary}>
            + Add Product
          </button>
        }
      />

      <label className="mb-4 inline-flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
          className="rounded border-[var(--border)]"
        />
        Show inactive
      </label>

      {isLoading ? (
        <LoadingSpinner message="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState message="No products yet. Add the policies your agency sells to start invoicing." />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={String(showInactive)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            <ProductList products={products} onSelect={openForm} />
          </motion.div>
        </AnimatePresence>
      )}

      <ProductFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} product={selected} />
    </div>
  );
}
