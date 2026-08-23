export interface BasketSuggestion {
  current_product: string;
  replacement: string;
  replacement_price?: number;
  current_price?: number;
  saving: number;
  reason: string[] | string;
}

export interface BasketOptimizationResult {
  current_total: number;
  optimized_total?: number;
  savings?: number;
  within_budget?: boolean;
  suggestions: BasketSuggestion[];
  message?: string;
}
