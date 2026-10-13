'use client';

import { useEffect, useState } from 'react';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';
import type { BillingInterval } from '@/lib/types/customers';
import type { ProductResponseDto } from '@/lib/types/products';
import { BILLING_INTERVAL_OPTIONS, PRODUCT_FORM_DEFAULTS } from '@/lib/constants/products';
import { FORM_INPUT_CLASS } from '@/lib/constants/forms';
import { useCreateProduct, useDeleteProduct, useUpdateProduct } from '@/lib/hooks/use-products';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Leave out to add a new product.
  product?: ProductResponseDto | null;
}

export default function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
  const [form, setForm] = useState(PRODUCT_FORM_DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const isEdit = !!product;
  const isSaving = createProduct.isPending || updateProduct.isPending;

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setForm(
      product
        ? {
            name: product.name,
            productType: product.productType ?? '',
            description: product.description ?? '',
            premium: (product.basePremiumCents / 100).toFixed(2),
            billingInterval: product.billingInterval,
            isActive: product.isActive,
          }
        : PRODUCT_FORM_DEFAULTS,
    );
  }, [isOpen, product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const basePremiumCents = Math.round(parseFloat(form.premium) * 100);
    if (Number.isNaN(basePremiumCents) || basePremiumCents < 0) {
      setError('Enter a valid premium amount');
      return;
    }

    const data = {
      name: form.name.trim(),
      productType: form.productType.trim() || undefined,
      description: form.description.trim() || undefined,
      basePremiumCents,
      billingInterval: form.billingInterval as BillingInterval,
      isActive: form.isActive,
    };

    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, data });
      } else {
        await createProduct.mutateAsync(data);
      }
      onClose();
    } catch {
      setError(isEdit ? 'Failed to save product' : 'Failed to add product');
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm(`Delete "${product.name}"? Invoices that already use it keep their lines.`)) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      onClose();
    } catch {
      setError('Failed to delete product');
    }
  };

  return (
    <SlideModal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className={FORM_INPUT_CLASS}
            placeholder="Term Life 20-Year"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Type <span className="text-subtle font-normal">(optional)</span>
          </label>
          <input
            type="text"
            name="productType"
            value={form.productType}
            onChange={handleChange}
            className={FORM_INPUT_CLASS}
            placeholder="Life, Auto, Home…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Base Premium ($)</label>
            <input
              type="number"
              name="premium"
              value={form.premium}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className={FORM_INPUT_CLASS}
              placeholder="120.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Billed</label>
            <select name="billingInterval" value={form.billingInterval} onChange={handleChange} className={FORM_INPUT_CLASS}>
              {BILLING_INTERVAL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Description <span className="text-subtle font-normal">(optional)</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className={FORM_INPUT_CLASS}
            placeholder="What's covered, who it's for"
          />
        </div>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-medium text-primary">Active</p>
            <p className="text-xs text-subtle">Inactive products can't be added to new invoices.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.isActive}
            onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
              form.isActive ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                form.isActive ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className={`${colors.button.primary} disabled:opacity-50`}>
            {isSaving ? 'Saving…' : isEdit ? 'Save' : 'Add Product'}
          </button>
        </div>

        {isEdit && (
          <div className="pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              Delete product
            </button>
          </div>
        )}
      </form>
    </SlideModal>
  );
}
