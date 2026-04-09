"use client";

import { useState, useCallback } from "react";
import { useCartStore } from "@/stores/cart-store";
import { Icon } from "@/components/ui/icon";
import type { CartItem } from "@/types/cart";

interface AddToCartButtonProps {
  item: Omit<CartItem, "quantity">;
  /** "primary" = full gradient pill (product catalog)
   *  "underline" = bottom-border text button (small cards, bento grid) */
  variant?: "primary" | "underline";
  className?: string;
}

export function AddToCartButton({
  item,
  variant = "primary",
  className = "",
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = useCallback(() => {
    if (added) return;
    addItem({ ...item, quantity: 1 });
    setAdded(true);
    const t = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(t);
  }, [added, addItem, item]);

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
        transition-colors duration-200 active:scale-[0.97]
        ${added
          ? "bg-primary-fixed text-primary"
          : "bg-gradient-to-r from-primary to-primary-container text-on-primary hover:opacity-90"
        } ${className}`}
    >
      {added ? (
        <>
          <Icon name="check_circle" size="sm" className="animate-check-in" />
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
