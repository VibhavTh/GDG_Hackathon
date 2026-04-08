"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/stores/cart-store";
import { Icon } from "@/components/ui/icon";
import type { OrderStatus } from "@/types/order";

export interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  products: {
    id: string;
    name: string;
    image_url: string | null;
  } | null;
}

export interface Order {
  id: string;
  order_number: string | null;
  status: OrderStatus;
  total_amount: number;
  guest_email: string | null;
  special_instructions: string | null;
  created_at: string;
  order_items: OrderItem[];
}

interface Props {
  order: Order;
}

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  pending_payment: { label: "Payment Being Confirmed", icon: "pending", color: "text-amber-600" },
  placed: { label: "Order Received", icon: "check_circle", color: "text-primary" },
  confirmed: { label: "Payment Confirmed", icon: "check_circle", color: "text-primary" },
  preparing: { label: "Being Prepared", icon: "restaurant", color: "text-blue-600" },
  ready: { label: "Ready for Pickup", icon: "storefront", color: "text-primary" },
  fulfilled: { label: "Completed", icon: "done_all", color: "text-primary" },
  cancelled: { label: "Cancelled", icon: "cancel", color: "text-error" },
  failed: { label: "Payment Failed", icon: "error", color: "text-error" },
  abandoned: { label: "Expired", icon: "schedule", color: "text-on-surface-variant" },
};

export function ConfirmationContent({ order }: Props) {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const statusConfig = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.confirmed;
  const isPendingPayment = order.status === "pending_payment";
  const displayOrderNumber = order.order_number ?? order.id.slice(0, 8).toUpperCase();

  return (
    <main className="flex-grow px-4 py-16 max-w-2xl mx-auto w-full">
      {/* Success Banner */}
      <div className="text-center mb-12">
        <div className={`inline-flex w-20 h-20 rounded-full items-center justify-center mb-6 ${
          isPendingPayment ? "bg-amber-50" : "bg-primary-fixed"
        }`}>
          <Icon
            name={statusConfig.icon}
            className={`text-4xl ${statusConfig.color}`}
          />
        </div>
        <h1 className="font-headline text-4xl md:text-5xl text-tertiary mb-3">
          {isPendingPayment ? "Almost there!" : "Order Placed!"}
        </h1>
        <p className="text-on-surface-variant font-body text-lg">
          {isPendingPayment
            ? "We're confirming your payment — this usually takes just a moment."
            : "Your harvest is on its way. We'll send you updates by email."}
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-surface-container-low rounded-xl p-8 mb-6">
        <div className="flex items-center justify-between mb-6 pb-4">
          <div>
            <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
              Order Number
            </p>
            <p className="font-headline text-2xl text-tertiary font-bold">
              {displayOrderNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
              Status
            </p>
            <span className={`text-sm font-bold ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {order.guest_email && (
          <div className="mb-6 p-3 bg-surface-container rounded-lg flex items-center gap-2">
            <Icon name="mail" size="sm" className="text-on-surface-variant shrink-0" />
            <p className="text-sm text-on-surface-variant">
              Confirmation sent to <span className="font-bold text-on-surface">{order.guest_email}</span>
            </p>
          </div>
        )}

        {/* Items */}
        <div className="space-y-4 mb-6">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              {item.products?.image_url ? (
                <Image
                  src={item.products.image_url}
                  alt={item.products.name ?? "Product"}
                  width={56}
                  height={56}
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg flex-shrink-0 bg-surface-container-highest flex items-center justify-center">
                  <Icon name="eco" className="text-on-surface-variant" size="sm" />
                </div>
              )}
              <div className="flex-grow">
                <p className="font-bold text-on-surface text-sm">
                  {item.products?.name ?? "Product"}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Qty: {item.quantity}
                </p>
              </div>
              <span className="font-headline text-lg text-tertiary">
                ${(item.unit_price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="pt-4 bg-surface-container -mx-8 px-8 pb-0 flex justify-between items-center">
          <span className="font-headline text-xl text-tertiary">Total</span>
          <span className="font-headline text-3xl text-primary">
            ${order.total_amount.toFixed(2)}
          </span>
        </div>

        {order.special_instructions && (
          <div className="mt-4 pt-4 flex gap-2 items-start">
            <Icon name="notes" size="sm" className="text-on-surface-variant mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                Your Notes
              </p>
              <p className="text-sm text-on-surface italic">{order.special_instructions}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/order-lookup?orderNumber=${encodeURIComponent(displayOrderNumber)}&email=${encodeURIComponent(order.guest_email ?? "")}`}
          className="flex-1 py-3 rounded-lg bg-surface-container-highest text-on-surface font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
        >
          <Icon name="track_changes" size="sm" />
          Track Your Order
        </Link>
        <Link
          href="/products"
          className="flex-1 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm text-center flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          Continue Shopping
          <Icon name="arrow_forward" size="sm" />
        </Link>
      </div>
    </main>
  );
}
