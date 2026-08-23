import { useState, useEffect, useCallback } from 'react';
import { RecommendationItem } from '@/types/recommendation';
import * as recApi from '@/lib/api/recommendations';
import { useApp } from '@/context/AppContext';

export function useRecommendations(limit = 6) {
  const { userId, activeContext } = useApp();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await recApi.getRecommendations(userId, limit);
      setRecommendations(data);
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError(err?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations, activeContext]);

  return {
    recommendations,
    loading,
    error,
    refresh: fetchRecommendations,
  };
}
