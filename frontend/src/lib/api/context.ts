import { apiClient } from './client';
import { ShoppingContext, ContextData } from '@/types/context';

export async function createShoppingContext(
  userId: string,
  contextType: string,
  contextData: ContextData,
  expiresAt?: string
): Promise<ShoppingContext> {
  const response = await apiClient<ShoppingContext>('context', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      context_type: contextType,
      context_data: contextData,
      expires_at: expiresAt,
    }),
  });
  return response.data!;
}

export async function getShoppingContexts(userId: string): Promise<ShoppingContext[]> {
  try {
    const response = await apiClient<{ count: number; contexts: ShoppingContext[] }>(`context/${userId}`, {
      method: 'GET',
      cache: 'no-store',
    });
    return response.data?.contexts || [];
  } catch (err) {
    console.warn('Failed to load shopping context:', err);
    return [];
  }
}

export async function deleteShoppingContext(contextId: string): Promise<boolean> {
  const response = await apiClient(`context/${contextId}`, {
    method: 'DELETE',
  });
  return response.success;
}
