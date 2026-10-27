import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi, type CreateProductRequest, type UpdateProductRequest } from '@/lib/api/products';
import { productKeys } from '@/lib/queries/keys';

export function useProducts(includeInactive = false, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: productKeys.list(includeInactive),
    queryFn: () => productsApi.getProducts(includeInactive),
    enabled: options?.enabled ?? true,
  });
}

function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all });
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.createProduct(data),
    onSuccess: invalidate,
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) => productsApi.updateProduct(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: invalidate,
  });
}
