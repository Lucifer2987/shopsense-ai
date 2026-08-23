import { Product } from './product';

export interface RecommendationItem {
  product: Product;
  score: number;
  reason: string[];
}
