"use client";

import { useState } from "react";
import { updateStock } from "@/app/(admin)/inventory/actions";

interface StockControlProps {
  productId: string;
  productName: string;
  initialStock: number;
}

export function StockControl({
  productId,
  productName,
  initialStock,
}: StockControlProps) {
  const [stock, setStock] = useState(initialStock);
  const [isPending, setIsPending] = useState(false);

  const handleChange = async (delta: number) => {
    const prev = stock;
    const next = Math.max(0, stock + delta);
    setStock(next); // optimistic
    setIsPending(true);
    const ok = await updateStock(productId, delta);
    setIsPending(false);
    if (!ok) setStock(prev); // rollback on failure
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <button
        onClick={() => handleChange(-1)}
        disabled={stock === 0 || isPending}
        aria-label={`Decrease stock for ${productName}`}
        className="w-11 h-11 rounded-full bg-surface-container-highest text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        -
      </button>
      <span
        aria-live="polite"
        aria-label={`${stock} in stock`}
        className={`font-bold text-sm min-w-[2ch] text-center transition-opacity ${
          isPending ? "opacity-50" : ""
        } ${stock <= 5 ? "text-error" : ""}`}
      >
        {stock}
      </span>
      <button
        onClick={() => handleChange(1)}
        disabled={isPending}
        aria-label={`Increase stock for ${productName}`}
        className="w-11 h-11 rounded-full bg-surface-container-highest text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
