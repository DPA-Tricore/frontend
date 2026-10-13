import { axiosClient } from '@/lib/api/axios-client';
import type { ProductResponseDto, CreateProductRequest, UpdateProductRequest } from '@/lib/types/products';

export type { ProductResponseDto, CreateProductRequest, UpdateProductRequest } from '@/lib/types/products';

export const productsApi = {
  async getProducts(includeInactive = false): Promise<ProductResponseDto[]> {
    const response = await axiosClient.get<ProductResponseDto[]>('/products', { params: { includeInactive } });
    return response.data;
  },

  async createProduct(data: CreateProductRequest): Promise<ProductResponseDto> {
    const response = await axiosClient.post<ProductResponseDto>('/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<ProductResponseDto> {
    const response = await axiosClient.patch<ProductResponseDto>(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await axiosClient.delete(`/products/${id}`);
  },
};
