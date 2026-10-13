import type { BillingInterval } from '@/lib/types/customers';

export interface ProductResponseDto {
  id: string;
  name: string;
  productType: string | null;
  description: string | null;
  basePremiumCents: number;
  billingInterval: BillingInterval;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  productType?: string;
  description?: string;
  basePremiumCents: number;
  billingInterval?: BillingInterval;
  isActive?: boolean;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;
