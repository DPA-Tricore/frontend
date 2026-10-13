import { getCustomerInvoiceStatusColor } from '@/lib/theme/colors';

export default function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCustomerInvoiceStatusColor(status)}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
