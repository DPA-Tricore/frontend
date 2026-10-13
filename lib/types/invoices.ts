// An agency invoicing its own client. Not the same as lib/types/billing.ts,
// which is this platform billing the agency.
export enum CustomerInvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  VOID = 'VOID',
}

export interface CustomerInvoiceItemResponseDto {
  id: string;
  productId: string | null;
  description: string;
  quantity: number;
  unitPriceCents: number;
  amountCents: number;
}

export interface CustomerInvoiceResponseDto {
  id: string;
  invoiceNumber: string;
  status: CustomerInvoiceStatus;
  leadId: string | null;
  customerId: string | null;
  billToName: string | null;
  issuedById: string | null;
  issueDate: string;
  dueDate: string;
  sentAt: string | null;
  paidAt: string | null;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  notes: string | null;
  items: CustomerInvoiceItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInvoiceItemRequest {
  productId?: string;
  description?: string;
  unitPriceCents?: number;
  quantity?: number;
}

export interface CreateCustomerInvoiceRequest {
  leadId?: string;
  customerId?: string;
  dueDate: string;
  taxCents?: number;
  notes?: string;
  items: CustomerInvoiceItemRequest[];
}

export type UpdateCustomerInvoiceRequest = Partial<Omit<CreateCustomerInvoiceRequest, 'leadId' | 'customerId'>>;

export interface CustomerInvoiceFilters {
  leadId?: string;
  customerId?: string;
  status?: CustomerInvoiceStatus;
}

export type InvoiceAction = 'send' | 'mark-paid' | 'void';

// Who an invoice is raised against. Fixed once the invoice exists.
export interface BillTo {
  type: 'lead' | 'customer';
  id: string;
  name: string;
}

// One editable line in the invoice form. Price is kept as typed dollars until submit.
export interface InvoiceLineDraft {
  key: string;
  productId: string;
  description: string;
  quantity: string;
  unitPrice: string;
}
