"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { Icon } from "@/components/ui/icon";

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, itemCount, removeItem, updateQuantity, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Redirect to products if cart is empty after hydration
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace("/products");
    }
  }, [mounted, items.length, router]);

  const sub = mounted ? subtotal() : 0;
  const count = mounted ? itemCount() : 0;

  if (!mounted || items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-label uppercase tracking-wider text-on-surface-variant/60 hover:text-primary transition-colors mb-6"
        >
          <Icon name="arrow_back" size="sm" />
          Continue Shopping
        </Link>
        <h1 className="font-headline italic text-4xl md:text-5xl text-tertiary">
          Your Basket
        </h1>
        <p className="text-on-surface-variant font-body mt-2">
          {count} item{count !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-7 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-surface-container-low rounded-xl p-5 flex gap-4 items-center group"
            >
              {/* Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container-highest flex-shrink-0 relative">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="eco" className="text-on-surface-variant" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-headline text-lg text-tertiary leading-tight truncate">
                  {item.name}
                </p>
                <p className="text-xs text-on-surface-variant font-label mt-0.5">
                  ${item.price.toFixed(2)} / {item.unit}
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-surface-variant active:scale-[0.93] transition-all duration-150 text-on-surface"
                    aria-label="Decrease quantity"
                  >
                    <Icon name="remove" size="sm" />
                  </button>
                  <span className="w-8 text-center font-label font-bold text-on-surface text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-surface-variant active:scale-[0.93] transition-all duration-150 text-on-surface"
                    aria-label="Increase quantity"
                  >
                    <Icon name="add" size="sm" />
                  </button>
                </div>
              </div>

              {/* Right: price + remove */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                <span className="font-headline text-xl text-primary">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-on-surface-variant/40 hover:text-error transition-colors duration-150 active:scale-[0.93]"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Icon name="delete" size="sm" />
                </button>
              </div>
            </div>
          ))}

          {/* Clear cart */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                clearCart();
                router.push("/products");
              }}
              className="text-xs text-on-surface-variant/50 hover:text-error transition-colors duration-150 font-label uppercase tracking-wider flex items-center gap-1"
            >
              <Icon name="delete_sweep" size="sm" />
              Clear cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <aside className="lg:col-span-5 sticky top-32">
          <div className="bg-surface-container rounded-2xl p-8">
            <h2 className="font-headline text-2xl text-tertiary mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal ({count} item{count !== 1 ? "s" : ""})</span>
                <span className="font-body">${sub.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Delivery fee</span>
                <span className="font-body text-xs italic">Calculated at checkout</span>
              </div>
              <div className="border-t border-outline-variant/30 pt-3 flex justify-between items-end">
                <span className="font-headline text-xl text-tertiary">Estimated Total</span>
                <span className="font-headline text-3xl text-primary">${sub.toFixed(2)}+</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-primary text-on-primary font-label font-bold py-4 rounded-xl hover:bg-primary/90 active:scale-[0.97] transition-all duration-150 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <Icon name="arrow_forward" size="sm" />
            </Link>

            {/* Trust note */}
            <div className="mt-6 flex items-start gap-3">
              <Icon name="lock" size="sm" className="text-on-surface-variant/40 mt-0.5 shrink-0" />
              <p className="text-[11px] text-on-surface-variant/50 font-body leading-relaxed">
                Payments are processed securely by Stripe. Your card details never touch our servers.
              </p>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}
