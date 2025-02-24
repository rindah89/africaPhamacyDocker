"use client";

import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  
  addToCart: (item: CartItem) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      
      return {
        items: [...state.items, item],
      };
    });
  },
  
  removeFromCart: (itemId: string) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    }));
  },
  
  updateQuantity: (itemId: string, quantity: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ),
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  get total() {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
})); 