import { apiClient } from './client';
import { RecommendationItem } from '@/types/recommendation';

export async function getRecommendations(userId: string, limit = 8): Promise<RecommendationItem[]> {
  try {
    const response = await apiClient<{ count: number; recommendations: RecommendationItem[] }>(
      `recommendations/${userId}?limit=${limit}`,
      {
        method: 'GET',
        cache: 'no-store',
      }
    );
    return response.data?.recommendations || [];
  } catch (err) {
    console.warn('Failed to load recommendations:', err);
    return [];
  }
}
