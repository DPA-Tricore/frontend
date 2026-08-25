'use client';

import { useState } from 'react';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';
import { useCreatePolicy } from '@/lib/hooks/use-customer-detail';
import { BillingInterval } from '@/lib/api/policies';

interface PolicyCreateModalProps {
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
}

const initialForm = {
  policyNumber: '',
  productType: '',
  premiumAmount: '',
  billingInterval: 'MONTH',
  effectiveDate: '',
  expirationDate: '',
};

export default function PolicyCreateModal({ customerId, isOpen, onClose }: PolicyCreateModalProps) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const createPolicy = useCreatePolicy(customerId);

  const reset = () => {
    setForm(initialForm);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const premiumAmountCents = Math.round(parseFloat(form.premiumAmount) * 100);
    if (!Number.isFinite(premiumAmountCents) || premiumAmountCents < 0) {
      setError('Enter a valid premium amount');
      return;
    }
    try {
      await createPolicy.mutateAsync({
        policyNumber: form.policyNumber,
        productType: form.productType || undefined,
        premiumAmountCents,
        billingInterval: form.billingInterval as BillingInterval,
        effectiveDate: new Date(form.effectiveDate).toISOString(),
        expirationDate: new Date(form.expirationDate).toISOString(),
      });
      reset();
      onClose();
    } catch {
      setError('Failed to create policy');
    }
  };

  return (
    <SlideModal isOpen={isOpen} onClose={handleClose} title="Add Policy">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Policy Number</label>
          <input
            type="text"
            name="policyNumber"
            value={form.policyNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="POL-00123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Product Type <span className="text-xs text-subtle font-normal">(optional)</span>
          </label>
          <input
            type="text"
            name="productType"
            value={form.productType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="Auto, Home, Life..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Premium ($)</label>
            <input
              type="number"
              name="premiumAmount"
              value={form.premiumAmount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              placeholder="120.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Billing</label>
            <select
              name="billingInterval"
              value={form.billingInterval}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            >
              <option value="MONTH">Monthly</option>
              <option value="QUARTER">Quarterly</option>
              <option value="YEAR">Yearly</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Effective Date</label>
            <input
              type="date"
              name="effectiveDate"
              value={form.effectiveDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Expiration Date</label>
            <input
              type="date"
              name="expirationDate"
              value={form.expirationDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={handleClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button type="submit" disabled={createPolicy.isPending} className={colors.button.primary}>
            Add Policy
          </button>
        </div>
      </form>
    </SlideModal>
  );
}
