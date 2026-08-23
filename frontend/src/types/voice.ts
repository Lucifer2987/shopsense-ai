import { Product } from './product';
import { ShoppingContext } from './context';
import { ShoppingItem, ShoppingList } from './shopping';
import { RecommendationItem } from './recommendation';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export interface AddedItem {
  product: string;
  brand?: string | null;
  price?: number;
  quantity: number;
  unit: string;
  alternatives?: string[];
}

export interface VoiceCommandPayload {
  text: string;
  list_id?: string;
  user_id?: string;
}

export interface VoiceCommandResponse {
  success: boolean;
  message?: string;
  data?: {
    added?: AddedItem[];
    not_found?: string[];
    products?: Product[];
    budget?: number;
    preference?: string;
    context?: ShoppingContext;
    recommendations?: RecommendationItem[];
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
  };
}
