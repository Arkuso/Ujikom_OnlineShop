import { create } from 'zustand';
import { CartItem } from '../types/cart';
import cartService from '../services/cartService';
import { getValidToken } from './authSession';

interface CartState {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  itemCount: 0,
  totalAmount: 0,

  fetchCart: async () => {
    try {
      if (!getValidToken()) {
        set({ items: [], itemCount: 0, totalAmount: 0 });
        return;
      }

      const response = await cartService.getCart();
      if (response.success && response.data) {
        const items = response.data;
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
        set({ items, itemCount, totalAmount });
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  },

  clearCart: () => {
    set({ items: [], itemCount: 0, totalAmount: 0 });
  },
}));
