export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/icon";
import type { OrderStatus } from "@/lib/supabase/types";
import { advanceOrderStatus, cancelOrder } from "../actions";

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending_payment: "bg-surface-container text-on-surface-variant",
  placed: "bg-surface-container-highest text-on-surface-variant",
  confirmed: "bg-primary-fixed text-on-primary-fixed",
  preparing: "bg-secondary-fixed text-on-secondary-fixed",
  ready: "bg-tertiary-fixed text-on-tertiary-fixed",
  fulfilled: "bg-surface-container text-on-surface-variant",
  cancelled: "bg-error-container text-on-error-container",
  failed: "bg-error-container text-on-error-container",
  abandoned: "bg-surface-container text-on-surface-variant",
};

const NEXT_STATUS: Partial<Record<OrderStatus, string>> = {
  placed: "Confirm",
  confirmed: "Mark Preparing",
  preparing: "Mark Ready",
  ready: "Mark Fulfilled",
};

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const service = createServiceClient();
  const { data: order } = await service
    .from("orders")
    .select(`
      id, status, total_amount, created_at, special_instructions,
      guest_email, customer_id, order_number, stripe_payment_intent, stripe_session_id,
      order_items (
        id, quantity, unit_price,
        products ( name, image_url, unit )
      )
    `)
    .eq("id", id)
    .single();

  if (!order) notFound();

  // Fetch address and charge breakdown from Stripe session
  let shippingAddress: string | null = null;
  let taxAmount: number | null = null;
  let shippingAmount: number | null = null;

  const sessionId = (order as unknown as { stripe_session_id: string | null }).stripe_session_id;
  if (sessionId) {
    try {
      const { stripe: stripeClient } = await import("@/lib/stripe/server");
      const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
        expand: ["total_details"],
      });
      const s = session as unknown as { shipping_details?: { address?: Record<string, string | null> }; customer_details?: { address?: Record<string, string | null> } };
      const addr = s.shipping_details?.address ?? s.customer_details?.address;
      if (addr) {
        shippingAddress = [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country]
          .filter(Boolean)
          .join(", ");
      }
      if (session.total_details) {
        taxAmount = session.total_details.amount_tax ?? null;
        shippingAmount = session.total_details.amount_shipping ?? null;
      }
    } catch {
      // Non-fatal -- Stripe session may have expired
    }
  }

  type OrderItem = {
    id: string;
    quantity: number;
    unit_price: number;
    products: { name: string; image_url: string | null; unit: string | null } | null;
  };

  type TypedOrder = {
    id: string;
    status: OrderStatus;
    total_amount: number;
    created_at: string;
    special_instructions: string | null;
    guest_email: string | null;
    customer_id: string | null;
    order_number: string | null;
    stripe_payment_intent: string | null;
    order_items: OrderItem[];
  };

  const o = order as unknown as TypedOrder;

  const nextLabel = NEXT_STATUS[o.status];
  const canCancel = ["placed", "confirmed", "preparing"].includes(o.status);
  const subtotal = o.order_items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const displayEmail = o.guest_email ?? "Registered customer";
  const orderRef = o.order_number ?? o.id.slice(0, 8).toUpperCase();

  return (
    <main className="flex-1 px-6 md:px-10 py-10 max-w-3xl">
      {/* Back */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-8"
      >
        <Icon name="arrow_back" size="sm" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline italic text-3xl text-tertiary">Order #{orderRef}</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {new Date(o.created_at).toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
            {" at "}
            {new Date(o.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
        <span className={`self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${STATUS_STYLE[o.status]}`}>
          {o.status.replace("_", " ")}
        </span>
      </div>

      {/* Customer */}
      <section className="bg-surface-container-low rounded-xl p-6 mb-4">
        <h2 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3">Customer</h2>
        <p className="text-sm font-medium text-on-surface">{displayEmail}</p>
        {shippingAddress && (
          <p className="text-sm text-on-surface-variant mt-1">{shippingAddress}</p>
        )}
      </section>

      {/* Items */}
      <section className="bg-surface-container-low rounded-xl p-6 mb-4">
        <h2 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4">Items</h2>
        <div className="space-y-4">
          {o.order_items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-highest shrink-0">
                {item.products?.image_url ? (
                  <Image
                    src={item.products.image_url}
                    alt={item.products.name ?? ""}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                    <Icon name="image" size="sm" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface">{item.products?.name ?? "Unknown product"}</p>
                <p className="text-xs text-on-surface-variant">
                  {item.quantity} {item.products?.unit ?? "each"} x {formatCents(item.unit_price)}
                </p>
              </div>
              <p className="text-sm font-semibold text-tertiary shrink-0">
                {formatCents(item.unit_price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-outline-variant/30 space-y-2">
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>Subtotal</span>
            <span>{formatCents(subtotal)}</span>
          </div>
          {shippingAmount !== null && shippingAmount > 0 && (
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Shipping</span>
              <span>{formatCents(shippingAmount)}</span>
            </div>
          )}
          {taxAmount !== null && taxAmount > 0 && (
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Tax</span>
              <span>{formatCents(taxAmount)}</span>
            </div>
          )}
          {/* Catch-all for any gap between line items and Stripe total */}
          {(() => {
            const accounted = subtotal + (shippingAmount ?? 0) + (taxAmount ?? 0);
            const gap = o.total_amount - accounted;
            return gap > 0 ? (
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Other charges</span>
                <span>{formatCents(gap)}</span>
              </div>
            ) : null;
          })()}
          <div className="flex justify-between text-base font-bold text-on-surface pt-1 border-t border-outline-variant/20">
            <span>Total</span>
            <span className="text-tertiary">{formatCents(o.total_amount)}</span>
          </div>
        </div>
      </section>

      {/* Special instructions */}
      {o.special_instructions && (
        <section className="bg-surface-container-low rounded-xl p-6 mb-4">
          <h2 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Special Instructions</h2>
          <p className="text-sm text-on-surface leading-relaxed">{o.special_instructions}</p>
        </section>
      )}

      {/* Actions */}
      {(nextLabel || canCancel) && (
        <section className="bg-surface-container-low rounded-xl p-6 flex flex-wrap gap-3">
          {nextLabel && (
            <form action={advanceOrderStatus.bind(null, o.id, o.status)}>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all duration-150"
              >
                {nextLabel}
              </button>
            </form>
          )}
          {canCancel && (
            <form action={cancelOrder.bind(null, o.id)}>
              <button
                type="submit"
                className="px-6 py-2.5 border border-error/40 text-error rounded-lg text-sm font-semibold hover:bg-error/5 active:scale-[0.97] transition-all duration-150"
              >
                Cancel Order
              </button>
            </form>
          )}
        </section>
      )}
    </main>
  );
}
