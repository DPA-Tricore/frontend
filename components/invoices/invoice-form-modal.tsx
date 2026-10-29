'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';
import { FORM_INPUT_CLASS } from '@/lib/constants/forms';
import { CUSTOM_LINE, DEFAULT_INVOICE_DUE_DAYS } from '@/lib/constants/invoices';
import { useProducts } from '@/lib/hooks/use-products';
import { useCreateInvoice, useUpdateInvoice } from '@/lib/hooks/use-invoices';
import { formatCentsAsMoney, parseDollarsToCents } from '@/lib/utils/format';
import type { BillTo, CustomerInvoiceResponseDto, InvoiceLineDraft } from '@/lib/types/invoices';
import BillToPicker from './bill-to-picker';
import { useResetOnOpen } from '@/lib/hooks/use-reset-on-open';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Set to edit a draft. Who it's billed to can't change.
  invoice?: CustomerInvoiceResponseDto | null;
  // Set when opened from a lead or customer page; otherwise the form asks.
  billTo?: BillTo | null;
}

const newLine = (): InvoiceLineDraft => ({
  key: crypto.randomUUID(),
  productId: CUSTOM_LINE,
  description: '',
  quantity: '1',
  unitPrice: '',
});

const defaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_INVOICE_DUE_DAYS);
  return date.toISOString().slice(0, 10);
};

const lineCents = (line: InvoiceLineDraft) =>
  (parseDollarsToCents(line.unitPrice) ?? 0) * (parseInt(line.quantity, 10) || 0);

export default function InvoiceFormModal({ isOpen, onClose, invoice, billTo: fixedBillTo }: InvoiceFormModalProps) {
  const router = useRouter();
  const { data: products = [] } = useProducts();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const isEdit = !!invoice;
  const isSaving = createInvoice.isPending || updateInvoice.isPending;

  const [billTo, setBillTo] = useState<BillTo | null>(null);
  const [lines, setLines] = useState<InvoiceLineDraft[]>([newLine()]);
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [tax, setTax] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useResetOnOpen(isOpen, () => {
    setError(null);
    setBillTo(fixedBillTo ?? null);
    if (invoice) {
      setLines(
        invoice.items.map((item) => ({
          key: item.id,
          productId: item.productId ?? CUSTOM_LINE,
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: (item.unitPriceCents / 100).toFixed(2),
        })),
      );
      setDueDate(invoice.dueDate.slice(0, 10));
      setTax(invoice.taxCents ? (invoice.taxCents / 100).toFixed(2) : '');
      setNotes(invoice.notes ?? '');
    } else {
      setLines([newLine()]);
      setDueDate(defaultDueDate());
      setTax('');
      setNotes('');
    }
  });

  const subtotalCents = useMemo(() => lines.reduce((sum, line) => sum + lineCents(line), 0), [lines]);
  const taxCents = parseDollarsToCents(tax) ?? 0;

  const updateLine = (key: string, patch: Partial<InvoiceLineDraft>) =>
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  // Picking a product fills in its name and price; both stay editable.
  const pickProduct = (key: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    updateLine(
      key,
      product
        ? { productId, description: product.name, unitPrice: (product.basePremiumCents / 100).toFixed(2) }
        : { productId: CUSTOM_LINE },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && !billTo) return setError('Choose who this invoice is for');

    const items = [];
    for (const line of lines) {
      const unitPriceCents = parseDollarsToCents(line.unitPrice);
      const quantity = parseInt(line.quantity, 10);
      if (!line.description.trim()) return setError('Every line needs a description');
      if (unitPriceCents === null) return setError('Every line needs a valid price');
      if (!quantity || quantity < 1) return setError('Quantity must be at least 1');
      items.push({
        productId: line.productId || undefined,
        description: line.description.trim(),
        unitPriceCents,
        quantity,
      });
    }
    if (parseDollarsToCents(tax || '0') === null) return setError('Enter a valid tax amount');

    const data = {
      dueDate: new Date(dueDate).toISOString(),
      taxCents,
      notes: notes.trim() || undefined,
      items,
    };

    try {
      if (invoice) {
        await updateInvoice.mutateAsync({ id: invoice.id, data });
        onClose();
      } else {
        const created = await createInvoice.mutateAsync({
          ...data,
          ...(billTo!.type === 'customer' ? { customerId: billTo!.id } : { leadId: billTo!.id }),
        });
        onClose();
        if (created) router.push(`/invoices/${created.id}`);
      }
    } catch {
      setError(isEdit ? 'Failed to save invoice' : 'Failed to create invoice');
    }
  };

  return (
    <SlideModal isOpen={isOpen} onClose={onClose} title={isEdit ? `Edit ${invoice!.invoiceNumber}` : 'New Invoice'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Bill To</label>
            {fixedBillTo ? (
              <p className="text-sm text-primary">{fixedBillTo.name}</p>
            ) : (
              <BillToPicker value={billTo} onChange={setBillTo} />
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Items</label>
          <div className="space-y-3">
            {lines.map((line) => (
              <div key={line.key} className="p-3 border border-[var(--border)] rounded-lg space-y-2">
                <div className="flex gap-2">
                  <select
                    value={line.productId}
                    onChange={(e) => pickProduct(line.key, e.target.value)}
                    className={FORM_INPUT_CLASS}
                  >
                    <option value={CUSTOM_LINE}>Custom item</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                      aria-label="Remove item"
                      className="px-2 text-subtle hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={line.description}
                  onChange={(e) => updateLine(line.key, { description: e.target.value })}
                  placeholder="Description"
                  className={FORM_INPUT_CLASS}
                />
                <div className="grid grid-cols-[4.5rem_1fr_auto] gap-2 items-center">
                  <input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                    aria-label="Quantity"
                    className={FORM_INPUT_CLASS}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(e) => updateLine(line.key, { unitPrice: e.target.value })}
                    placeholder="Price ($)"
                    aria-label="Unit price"
                    className={FORM_INPUT_CLASS}
                  />
                  <span className="text-sm text-primary tabular-nums text-right w-20">
                    {formatCentsAsMoney(lineCents(line))}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLines((prev) => [...prev, newLine()])}
            className={`${colors.button.text} mt-3 flex items-center gap-1.5`}
          >
            <Plus size={14} /> Add item
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className={FORM_INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Tax ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              placeholder="0.00"
              className={FORM_INPUT_CLASS}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Notes <span className="text-subtle font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Payment instructions, policy reference…"
            className={FORM_INPUT_CLASS}
          />
        </div>

        <div className="space-y-1 text-sm border-t border-[var(--border)] pt-4">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCentsAsMoney(subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Tax</span>
            <span className="tabular-nums">{formatCentsAsMoney(taxCents)}</span>
          </div>
          <div className="flex justify-between font-semibold text-primary pt-1">
            <span>Total</span>
            <span className="tabular-nums">{formatCentsAsMoney(subtotalCents + taxCents)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className={colors.button.secondary}>
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className={`${colors.button.primary} disabled:opacity-50`}>
            {isSaving ? 'Saving…' : isEdit ? 'Save' : 'Create Draft'}
          </button>
        </div>
      </form>
    </SlideModal>
  );
}
