"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cart, CartItem } from "@/types/cart";

interface CartStore extends Cart {
  addItem: (farmId: string, item: CartItem) => boolean;
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
      farmId: null,
      items: [],
      specialInstructions: "",

      addItem: (farmId: string, item: CartItem) => {
        const state = get();

        // Single-farm constraint: if adding from a different farm, return false
        // (caller should show confirmation dialog before clearing)
        if (state.farmId && state.farmId !== farmId && state.items.length > 0) {
          return false;
        }

        const existing = state.items.find(
          (i) => i.productId === item.productId
        );
        if (existing) {
          set({
            farmId,
            items: state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ farmId, items: [...state.items, item] });
        }
        return true;
      },

      removeItem: (productId: string) => {
        const items = get().items.filter((i) => i.productId !== productId);
        set({ items, farmId: items.length === 0 ? null : get().farmId });
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
        set({ farmId: null, items: [], specialInstructions: "" });
      },

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "green-market-cart" }
  )
);
