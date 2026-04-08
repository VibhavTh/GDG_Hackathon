"use client";

import { useState, useCallback } from "react";
import { useCartStore } from "@/stores/cart-store";
import { Icon } from "@/components/ui/icon";
import type { CartItem } from "@/types/cart";

interface AddToCartButtonProps {
  item: Omit<CartItem, "quantity">;
  farmId: string;
  /** "primary" = full gradient pill (product catalog)
   *  "underline" = bottom-border text button (small cards, bento grid) */
  variant?: "primary" | "underline";
  className?: string;
}

export function AddToCartButton({
  item,
  farmId,
  variant = "primary",
  className = "",
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [conflictPending, setConflictPending] = useState(false);
  const { addItem, clearCart } = useCartStore();

  const handleAdd = useCallback(() => {
    if (added) return;
    const success = addItem(farmId, { ...item, quantity: 1 });
    if (!success) {
      setConflictPending(true);
      return;
    }
    setAdded(true);
    const t = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(t);
  }, [added, addItem, farmId, item]);

  const handleConfirmSwitch = useCallback(() => {
    clearCart();
    addItem(farmId, { ...item, quantity: 1 });
    setConflictPending(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }, [addItem, clearCart, farmId, item]);

  if (conflictPending) {
    return (
      <div className="w-full rounded-md bg-surface-container-highest p-3 text-center space-y-2">
        <p className="text-xs text-on-surface-variant font-body leading-snug">
          Your cart has items from another farm. Clear it and start fresh?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setConflictPending(false)}
            className="flex-1 py-1.5 rounded text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Keep Cart
          </button>
          <button
            onClick={handleConfirmSwitch}
            className="flex-1 py-1.5 rounded bg-secondary text-on-secondary text-xs font-bold hover:bg-secondary/90 transition-colors"
          >
            Clear & Add
          </button>
        </div>
      </div>
    );
  }

  if (variant === "underline") {
    return (
      <button
        onClick={handleAdd}
        className={`w-full py-2 border-b-2 font-label font-bold text-xs transition-all duration-300
          ${added
            ? "border-primary text-primary"
            : "border-primary/20 text-primary hover:border-primary"
          } ${className}`}
      >
        {added ? "✓ ADDED" : "ADD TO CART"}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full py-3 rounded-md font-medium text-sm flex items-center justify-center gap-2
        transition-all duration-300 active:scale-95
        ${added
          ? "bg-primary-fixed text-primary"
          : "bg-gradient-to-r from-primary to-primary-container text-on-primary hover:opacity-90"
        } ${className}`}
    >
      {added ? (
        <>
          <Icon name="check_circle" size="sm" />
          Added to Basket
        </>
      ) : (
        <>
          <Icon name="shopping_basket" size="sm" />
          Add to Cart
        </>
      )}
    </button>
  );
}
