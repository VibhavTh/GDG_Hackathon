"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { deleteProduct, toggleProductActive } from "@/app/(admin)/inventory/actions";

interface Props {
  productId: string;
  productName: string;
  isActive: boolean;
}

export function ProductActions({ productId, productName, isActive }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    await deleteProduct(productId);
    setPending(false);
    setConfirming(false);
  }

  async function handleToggle() {
    setPending(true);
    await toggleProductActive(productId, !isActive);
    setPending(false);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 bg-surface-container-lowest rounded-lg px-3 py-1.5 shadow-ambient">
        <span className="text-xs text-on-surface-variant font-body">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="text-xs font-bold text-error hover:underline underline-offset-2 disabled:opacity-60"
        >
          Yes
        </button>
        <span className="text-on-surface-variant/40 text-xs">·</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-bold text-primary hover:underline underline-offset-2"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={pending}
        className={`p-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary rounded disabled:opacity-60 ${
          isActive
            ? "text-on-surface-variant hover:text-secondary"
            : "text-primary"
        }`}
        aria-label={isActive ? `Pause ${productName}` : `Unpause ${productName}`}
        title={isActive ? "Pause listing" : "Resume listing"}
      >
        <Icon name={isActive ? "pause_circle" : "play_circle"} />
      </button>
      <button
        onClick={() => setConfirming(true)}
        disabled={pending}
        className="p-2 text-on-surface-variant hover:text-error transition-colors focus-visible:outline-2 focus-visible:outline-error rounded disabled:opacity-60"
        aria-label={`Delete ${productName}`}
        title="Delete product"
      >
        <Icon name="delete" />
      </button>
    </>
  );
}
