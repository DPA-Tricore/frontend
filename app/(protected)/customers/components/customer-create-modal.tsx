'use client';

import { useState } from 'react';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';
import { useCreateCustomer } from '@/lib/hooks/use-customers';

interface CustomerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CustomerCreateModal({ isOpen, onClose, onCreated }: CustomerCreateModalProps) {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [error, setError] = useState<string | null>(null);
  const createCustomer = useCreateCustomer();

  const reset = () => {
    setFormData({ firstName: '', lastName: '', email: '', phone: '' });
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { email, phone, ...rest } = formData;
      await createCustomer.mutateAsync({
        ...rest,
        ...(email.trim() && { email: email.trim() }),
        ...(phone.trim() && { phone: phone.trim() }),
      });
      reset();
      onClose();
      onCreated();
    } catch {
      setError('Failed to create customer');
    }
  };

  return (
    <SlideModal isOpen={isOpen} onClose={handleClose} title="Add Customer">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <p className="text-xs text-subtle -mt-2">
          Most customers come from converting a lead — use this only for adding one directly (e.g. a
          referral or migrated record).
        </p>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="Jane"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            placeholder="Doe"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Email <span className="text-subtle font-normal">(optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Phone <span className="text-subtle font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              placeholder="+1 555 0100"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={handleClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button type="submit" className={colors.button.primary}>
            Add Customer
          </button>
        </div>
      </form>
    </SlideModal>
  );
}
