import { apiClient } from './client';
import { BasketOptimizationResult } from '@/types/basket';

export async function optimizeBasket(listId: string, budget?: number): Promise<BasketOptimizationResult> {
  const response = await apiClient<BasketOptimizationResult>('basket/optimize', {
    method: 'POST',
    body: JSON.stringify({
      list_id: listId,
      ...(budget !== undefined && budget > 0 ? { budget } : {}),
    }),
  });
  return response.data!;
}
