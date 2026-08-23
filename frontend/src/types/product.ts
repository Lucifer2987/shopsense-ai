export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  price: number;
  unit: string;
  stock: boolean | number;
  season?: string | null;
  tags?: Record<string, any> | string[] | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  max_price?: number;
  min_price?: number;
  in_stock?: boolean;
}

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';
