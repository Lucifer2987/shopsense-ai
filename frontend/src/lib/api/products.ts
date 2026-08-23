import { apiClient } from './client';
import { Product, ProductFilters } from '@/types/product';

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const query = new URLSearchParams();

  if (filters.search) query.set('search', filters.search);
  if (filters.category && filters.category !== 'All') query.set('category', filters.category);
  if (filters.brand) query.set('brand', filters.brand);
  if (filters.max_price !== undefined && filters.max_price > 0) query.set('max_price', String(filters.max_price));
  if (filters.min_price !== undefined && filters.min_price > 0) query.set('min_price', String(filters.min_price));
  if (filters.in_stock !== undefined) query.set('in_stock', String(filters.in_stock));

  const endpoint = `products${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await apiClient<{ count: number; products: Product[] }>(endpoint, {
    method: 'GET',
    cache: 'no-store',
  });

  return response.data?.products || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const response = await apiClient<Product>(`products/${id}`, {
    method: 'GET',
  });
  return response.data || null;
}

export async function searchProducts(q: string): Promise<Product[]> {
  const response = await apiClient<{ count: number; products: Product[]; query: string }>(
    `products/search?q=${encodeURIComponent(q)}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );
  return response.data?.products || [];
}
