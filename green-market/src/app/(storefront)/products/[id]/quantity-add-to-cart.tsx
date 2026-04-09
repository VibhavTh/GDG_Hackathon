"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useCartStore } from "@/stores/cart-store";
import type { CartItem } from "@/types/cart";

interface Props {
  farmId: string;
  item: Omit<CartItem, "quantity">;
}

export function QuantityAddToCart({ farmId, item }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [conflict, setConflict] = useState(false);
  const { addItem, clearCart } = useCartStore();

  function dec() { setQuantity((q) => Math.max(1, q - 1)); }
  function inc() { setQuantity((q) => q + 1); }

  function handleAdd() {
    const success = addItem(farmId, { ...item, quantity });
    if (!success) { setConflict(true); return; }
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleConfirmSwitch() {
    clearCart();
    addItem(farmId, { ...item, quantity });
    setConflict(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (conflict) {
    return (
      <div className="w-full rounded-xl bg-surface-container-highest p-5 space-y-3">
        <p className="text-sm text-on-surface-variant font-body leading-snug">
          Your cart has items from another farm. Clear it and start fresh?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConflict(false)}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors border border-outline-variant"
          >
            Keep Cart
          </button>
          <button
            onClick={handleConfirmSwitch}
            className="flex-1 py-2.5 rounded-lg bg-secondary text-on-secondary text-sm font-bold hover:bg-secondary/90 active:scale-[0.97] transition-all duration-150"
          >
            Clear & Add
          </button>
        </div>
      </div>
    );
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
