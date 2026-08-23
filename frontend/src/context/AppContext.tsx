'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { ShoppingList, ShoppingItem } from '@/types/shopping';
import { ShoppingContext } from '@/types/context';
import { Product } from '@/types/product';
import * as shoppingApi from '@/lib/api/shopping';
import * as contextApi from '@/lib/api/context';

interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface AppContextType {
  userId: string;
  list: ShoppingList | null;
  listId: string;
  listLoading: boolean;
  activeContext: ShoppingContext | null;
  budget: number | null;
  isCartOpen: boolean;
  isVoiceModalOpen: boolean;
  isOptimizerOpen: boolean;
  toasts: ToastInfo[];
  
  // Actions
  setIsCartOpen: (open: boolean) => void;
  setIsVoiceModalOpen: (open: boolean) => void;
  setIsOptimizerOpen: (open: boolean) => void;
  setBudget: (budget: number | null) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  
  // Shopping list actions
  ensureList: () => Promise<ShoppingList | null>;
  refreshList: () => Promise<void>;
  addItem: (product: Product, quantity?: number, unit?: string) => Promise<void>;
  updateItemQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  toggleItemComplete: (itemId: string, currentCompleted: boolean) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearList: () => Promise<void>;
  
  // Context actions
  refreshContext: () => Promise<void>;
  clearContext: () => Promise<void>;
  setNewContext: (type: string, data: any) => Promise<void>;
  
  // Calculations
  itemCount: number;
  subtotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Canonical default shopper ID present in backend profiles
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return DEFAULT_USER_ID;
  localStorage.setItem('shopsense-user-id', DEFAULT_USER_ID);
  return DEFAULT_USER_ID;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userId] = useState<string>(DEFAULT_USER_ID);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [activeContext, setActiveContext] = useState<ShoppingContext | null>(null);
  const [budget, setBudgetState] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const listRef = useRef<ShoppingList | null>(null);
  listRef.current = list;

  // Singleton promise to prevent concurrent list creation race conditions
  const ensureListPromiseRef = useRef<Promise<ShoppingList | null>>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setBudget = useCallback((b: number | null) => {
    setBudgetState(b);
    if (b) {
      localStorage.setItem('shopsense-budget', String(b));
    } else {
      localStorage.removeItem('shopsense-budget');
    }
  }, []);

  // Ensure shopping list exists and is loaded (single source of truth with deduplication)
  const ensureList = useCallback(async (): Promise<ShoppingList | null> => {
    if (listRef.current?.id) {
      return listRef.current;
    }

    if (ensureListPromiseRef.current) {
      return ensureListPromiseRef.current;
    }

    const runEnsure = async (): Promise<ShoppingList | null> => {
      const storedListId = typeof window !== 'undefined' ? localStorage.getItem('shopsense-current-list-id') : null;

      if (storedListId) {
        try {
          const fetched = await shoppingApi.getShoppingList(storedListId);
          if (fetched?.id) {
            setList(fetched);
            return fetched;
          }
        } catch (err) {
          console.warn('[ShopSense] Stored list not found, will create fresh one:', err);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('shopsense-current-list-id');
          }
        }
      }

      // Create new list for default user
      try {
        console.log('[ShopSense] Initializing shopping list for user:', DEFAULT_USER_ID);
        const created = await shoppingApi.createShoppingList(DEFAULT_USER_ID, 'My Grocery List');
        if (created?.id) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('shopsense-current-list-id', created.id);
          }
          setList(created);
          return created;
        }
      } catch (err) {
        console.error('[ShopSense] Failed to create shopping list:', err);
      }

      return null;
    };

    ensureListPromiseRef.current = runEnsure().finally(() => {
      ensureListPromiseRef.current = null;
    });

    return ensureListPromiseRef.current;
  }, []);

  // Initial load on mount
  const initList = useCallback(async () => {
    setListLoading(true);
    try {
      await ensureList();
    } finally {
      setListLoading(false);
    }
  }, [ensureList]);

  const refreshList = useCallback(async () => {
    const currentId = listRef.current?.id || (typeof window !== 'undefined' ? localStorage.getItem('shopsense-current-list-id') : null);
    if (!currentId) return;
    try {
      const updated = await shoppingApi.getShoppingList(currentId);
      if (updated) {
        setList(updated);
      }
    } catch (err) {
      console.error('[ShopSense] Failed to refresh list:', err);
    }
  }, []);

  const refreshContext = useCallback(async () => {
    try {
      const contexts = await contextApi.getShoppingContexts(DEFAULT_USER_ID);
      if (contexts.length > 0) {
        setActiveContext(contexts[0]);
        if (contexts[0].context_data?.budget && !budget) {
          setBudgetState(Number(contexts[0].context_data.budget));
        }
      } else {
        setActiveContext(null);
      }
    } catch (err) {
      console.warn('[ShopSense] Failed to load contexts:', err);
    }
  }, [budget]);

  useEffect(() => {
    getOrCreateUserId();
    initList();

    const savedBudget = localStorage.getItem('shopsense-budget');
    if (savedBudget) {
      setBudgetState(Number(savedBudget));
    }
  }, [initList]);

  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  // Add Item to list
  const addItem = useCallback(async (product: Product, quantity = 1, unit?: string) => {
    const targetList = await ensureList();
    if (!targetList?.id) {
      showToast("Shopping list isn't ready yet. Please try again.", 'error');
      return;
    }

    try {
      const finalUnit = unit || product.unit || 'piece';
      await shoppingApi.addItemToList(targetList.id, {
        product_id: product.id,
        quantity,
        unit: finalUnit,
      });

      await refreshList();
      showToast(`Added ${quantity} ${product.name} to basket`, 'success');
    } catch (err: any) {
      console.error('[ShopSense] Failed to add item:', err);
      showToast(err?.message || 'Could not add item', 'error');
    }
  }, [ensureList, refreshList, showToast]);

  // Update Item Quantity
  const updateItemQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    // Optimistic local update
    setList(prev => {
      if (!prev || !prev.shopping_items) return prev;
      return {
        ...prev,
        shopping_items: prev.shopping_items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      };
    });

    try {
      await shoppingApi.updateShoppingItem(itemId, { quantity: newQuantity });
      await refreshList();
    } catch (err: any) {
      console.error('[ShopSense] Failed to update quantity:', err);
      showToast('Failed to update quantity', 'error');
      await refreshList();
    }
  }, [refreshList, showToast]);

  // Toggle item complete
  const toggleItemComplete = useCallback(async (itemId: string, currentCompleted: boolean) => {
    setList(prev => {
      if (!prev || !prev.shopping_items) return prev;
      return {
        ...prev,
        shopping_items: prev.shopping_items.map(item =>
          item.id === itemId ? { ...item, is_completed: !currentCompleted } : item
        ),
      };
    });

    try {
      await shoppingApi.updateShoppingItem(itemId, { is_completed: !currentCompleted });
      await refreshList();
    } catch (err) {
      console.error('[ShopSense] Failed to toggle completion:', err);
      await refreshList();
    }
  }, [refreshList]);

  // Remove Item
  const removeItem = useCallback(async (itemId: string) => {
    setList(prev => {
      if (!prev || !prev.shopping_items) return prev;
      return {
        ...prev,
        shopping_items: prev.shopping_items.filter(item => item.id !== itemId),
      };
    });

    try {
      await shoppingApi.deleteShoppingItem(itemId);
      showToast('Item removed from basket', 'info');
      await refreshList();
    } catch (err: any) {
      console.error('[ShopSense] Failed to remove item:', err);
      showToast('Failed to remove item', 'error');
      await refreshList();
    }
  }, [refreshList, showToast]);

  // Clear list
  const clearList = useCallback(async () => {
    if (!list?.shopping_items || list.shopping_items.length === 0) return;
    try {
      for (const item of list.shopping_items) {
        await shoppingApi.deleteShoppingItem(item.id);
      }
      await refreshList();
      showToast('Shopping list cleared', 'info');
    } catch (err) {
      console.error('[ShopSense] Failed to clear list:', err);
    }
  }, [list?.shopping_items, refreshList, showToast]);

  // Context management
  const clearContext = useCallback(async () => {
    if (!activeContext?.id) return;
    try {
      await contextApi.deleteShoppingContext(activeContext.id);
      setActiveContext(null);
      showToast('Shopping plan cleared', 'info');
    } catch (err) {
      console.error('[ShopSense] Failed to delete context:', err);
    }
  }, [activeContext?.id, showToast]);

  const setNewContext = useCallback(async (type: string, data: any) => {
    try {
      const created = await contextApi.createShoppingContext(DEFAULT_USER_ID, type, data);
      setActiveContext(created);
      if (data.budget) {
        setBudget(Number(data.budget));
      }
      showToast(`Shopping plan set: ${type}`, 'success');
    } catch (err: any) {
      console.error('[ShopSense] Failed to create context:', err);
      showToast('Failed to save plan', 'error');
    }
  }, [setBudget, showToast]);

  // Totals calculations
  const items = list?.shopping_items || [];
  const itemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const subtotal = items.reduce((acc, item) => {
    const price = item.products?.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  return (
    <AppContext.Provider
      value={{
        userId: DEFAULT_USER_ID,
        list,
        listId: list?.id || '',
        listLoading,
        activeContext,
        budget,
        isCartOpen,
        isVoiceModalOpen,
        isOptimizerOpen,
        toasts,
        setIsCartOpen,
        setIsVoiceModalOpen,
        setIsOptimizerOpen,
        setBudget,
        showToast,
        removeToast,
        ensureList,
        refreshList,
        addItem,
        updateItemQuantity,
        toggleItemComplete,
        removeItem,
        clearList,
        refreshContext,
        clearContext,
        setNewContext,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
