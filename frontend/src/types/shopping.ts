import { Product } from './product';

export interface ShoppingItem {
  id: string;
  list_id: string;
  product_id: string;
  quantity: number;
  unit: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
  products?: Product | null;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  shopping_items?: ShoppingItem[];
}

export interface AddItemRequest {
  product_id: string;
  quantity: number;
  unit: string;
}

export interface UpdateItemRequest {
  quantity?: number;
  is_completed?: boolean;
}
