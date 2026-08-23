export interface ContextData {
  people?: number;
  budget?: number;
  preferences?: string[];
  date?: string;
  type?: string;
  [key: string]: any;
}

export interface ShoppingContext {
  id: string;
  user_id: string;
  context_type: string;
  context_data: ContextData;
  expires_at?: string | null;
  created_at?: string;
}
