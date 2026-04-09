"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useCartStore } from "@/stores/cart-store";
import type { CartItem } from "@/types/cart";

interface Props {
  item: Omit<CartItem, "quantity">;
}

export function QuantityAddToCart({ item }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function dec() { setQuantity((q) => Math.max(1, q - 1)); }
  function inc() { setQuantity((q) => q + 1); }

  function handleAdd() {
    addItem({ ...item, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="flex gap-3">
      {/* Quantity stepper */}
      <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-3">
        <button
          onClick={dec}
          disabled={quantity <= 1}
          className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-surface-variant active:scale-[0.93] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
        >
          <Icon name="remove" size="sm" />
        </button>
        <span className="w-8 text-center font-label font-bold text-on-surface text-lg">
          {quantity}
        </span>
        <button
          onClick={inc}
          className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-surface-variant active:scale-[0.93] transition-all duration-150"
          aria-label="Increase quantity"
        >
          <Icon name="add" size="sm" />
        </button>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAdd}
        className={`flex-1 py-3 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2
          transition-all duration-200 active:scale-[0.97]
          ${added
            ? "bg-primary-fixed text-primary"
            : "bg-gradient-to-r from-primary to-primary-container text-on-primary hover:opacity-90"
          }`}
      >
        {added ? (
          <>
            <Icon name="check_circle" size="sm" />
            Added to Basket
          </>
        ) : (
          <>
            <Icon name="shopping_basket" size="sm" />
            Add {quantity > 1 ? `${quantity} ` : ""}to Cart
          </>
        )}
      </button>
    </div>
  );
}
