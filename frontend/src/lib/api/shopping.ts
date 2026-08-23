import { apiClient } from './client';
import { ShoppingList, ShoppingItem, AddItemRequest, UpdateItemRequest } from '@/types/shopping';

export async function createShoppingList(userId: string, name = 'My Shopping List'): Promise<ShoppingList> {
  const response = await apiClient<ShoppingList>('shopping-lists', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, name }),
  });
  return response.data!;
}

export async function getShoppingList(listId: string): Promise<ShoppingList | null> {
  try {
    const response = await apiClient<ShoppingList>(`shopping-lists/${listId}`, {
      method: 'GET',
      cache: 'no-store',
    });
    return response.data || null;
  } catch (err: any) {
    if (err.status === 404 || err.code === 'LIST_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}

export async function deleteShoppingList(listId: string): Promise<boolean> {
  const response = await apiClient(`shopping-lists/${listId}`, {
    method: 'DELETE',
  });
  return response.success;
}

export async function addItemToList(listId: string, item: AddItemRequest): Promise<ShoppingItem> {
  const response = await apiClient<ShoppingItem>(`shopping-lists/${listId}/items`, {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return response.data!;
}

export async function updateShoppingItem(itemId: string, updates: UpdateItemRequest): Promise<ShoppingItem> {
  const response = await apiClient<ShoppingItem>(`shopping-items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return response.data!;
}

export async function deleteShoppingItem(itemId: string): Promise<boolean> {
  const response = await apiClient(`shopping-items/${itemId}`, {
    method: 'DELETE',
  });
  return response.success;
}
