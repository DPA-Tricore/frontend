import { CustomerInvoiceStatus } from '@/lib/types/invoices';

export const INVOICE_STATUS_TABS: { value: CustomerInvoiceStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: CustomerInvoiceStatus.DRAFT, label: 'Draft' },
  { value: CustomerInvoiceStatus.SENT, label: 'Sent' },
  { value: CustomerInvoiceStatus.OVERDUE, label: 'Overdue' },
  { value: CustomerInvoiceStatus.PAID, label: 'Paid' },
  { value: CustomerInvoiceStatus.VOID, label: 'Void' },
];

// Matches the backend's role rules on /customer-invoices.
export const INVOICE_EDITOR_ROLES = ['ORG_ADMIN', 'MANAGER', 'AGENT'];
export const INVOICE_ADMIN_ROLES = ['ORG_ADMIN', 'MANAGER'];

export const DEFAULT_INVOICE_DUE_DAYS = 14;

// The product picker's value for a typed-in line that isn't from the catalog.
export const CUSTOM_LINE = '';

export const BILL_TO_SEARCH_LIMIT = 6;
