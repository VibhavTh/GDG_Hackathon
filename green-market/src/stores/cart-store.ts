"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cart, CartItem } from "@/types/cart";

interface CartStore extends Cart {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setSpecialInstructions: (instructions: string) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      specialInstructions: "",

      addItem: (item: CartItem) => {
        const state = get();
        const existing = state.items.find(
          (i) => i.productId === item.productId
        );
        if (existing) {
          set({
            items: state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...state.items, item] });
        }
      },

      removeItem: (productId: string) => {
        const items = get().items.filter((i) => i.productId !== productId);
        set({ items });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      setSpecialInstructions: (instructions: string) => {
        set({ specialInstructions: instructions });
      },

      clearCart: () => {
        set({ items: [], specialInstructions: "" });
      },

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "green-market-cart",
      version: 2,
      migrate: () => {
        // v1 had root-level farmId -- clear cart on migration
        return { items: [], specialInstructions: "" };
      },
    }
  )
);
