"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { OrderStatus } from "@/types/order";

const STATUS_STEPS: OrderStatus[] = ["confirmed", "preparing", "ready", "fulfilled"];

const STATUS_CONFIG: Record<string, { label: string; icon: string; description: string }> = {
  pending_payment: { label: "Awaiting Payment", icon: "pending", description: "Payment is being processed." },
  placed: { label: "Order Received", icon: "check_circle", description: "Your order has been received." },
  confirmed: { label: "Confirmed", icon: "check_circle", description: "Payment confirmed. Your order is queued." },
  preparing: { label: "Being Prepared", icon: "restaurant", description: "The farm is preparing your items." },
  ready: { label: "Ready for Pickup", icon: "storefront", description: "Your order is ready! Head to the South Gate stall." },
  fulfilled: { label: "Completed", icon: "done_all", description: "Your order has been fulfilled. Enjoy!" },
  cancelled: { label: "Cancelled", icon: "cancel", description: "This order was cancelled." },
  failed: { label: "Payment Failed", icon: "error", description: "Payment could not be processed. Please try ordering again." },
  abandoned: { label: "Expired", icon: "schedule", description: "This order expired before payment was completed." },
};

const TERMINAL_STATUSES: OrderStatus[] = ["fulfilled", "cancelled", "failed", "abandoned"];

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  products: { id: string; name: string; image_url: string | null } | null;
}

interface OrderResult {
  id: string;
  order_number: string | null;
  status: OrderStatus;
  total_amount: number;
  special_instructions: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrderLookupPage() {
  const searchParams = useSearchParams();

  const [orderNumber, setOrderNumber] = useState(searchParams.get("orderNumber") ?? "");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResult | null>(null);

  const handleLookup = useCallback(async (num: string, em: string) => {
    if (!num.trim() || !em.trim()) return;
    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(
        `/api/orders/lookup?orderNumber=${encodeURIComponent(num.trim().toUpperCase())}&email=${encodeURIComponent(em.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Order not found.");
        return;
      }
      setOrder(data.order);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-submit if arriving from confirmation page with params
  useEffect(() => {
    const num = searchParams.get("orderNumber");
    const em = searchParams.get("email");
    if (num && em) {
      handleLookup(num, em);
    }
  }, [searchParams, handleLookup]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleLookup(orderNumber, email);
  }

  const activeStepIndex = order
    ? STATUS_STEPS.indexOf(order.status as OrderStatus)
    : -1;
  const isTerminal = order ? TERMINAL_STATUSES.includes(order.status) : false;
  const statusConfig = order ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG.confirmed) : null;

  return (
    <main className="flex-grow flex flex-col items-center justify-center px-4 py-16">
      {/* Header */}
      <div className="w-full bg-surface-container-low py-12 mb-12">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h1 className="text-5xl md:text-6xl font-headline text-tertiary mb-6 tracking-tight">
            Track Your Harvest
          </h1>
          <p className="text-lg text-on-surface-variant font-body leading-relaxed">
            Whether it&rsquo;s heirloom tomatoes or hand-turned butter, we&rsquo;re
            carefully preparing your local goodies for their journey from our
            fields to your table.
          </p>
        </div>
      </div>

      {/* Lookup Card */}
      <div className="relative w-full max-w-4xl grid md:grid-cols-12 gap-8 items-stretch">
        {/* Harvest Image */}
        <div className="md:col-span-5 relative h-64 md:h-auto min-h-[400px]">
          <div className="absolute inset-0 bg-surface-container-low rounded-xl overflow-hidden -rotate-2 transform transition-transform hover:rotate-0 duration-500">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBke-gdqjfW8Yk5iiExuyKd8nK-P_0tIu4E6m7Zvl6U20SjC9G9OaLXrS8fSbv9DD9Yx20BcEO71XbGx5F3PyTsQGh6cao-A8fTjMnW4yuOn2OBHAIJYFLp9-moviI3DcOUt9nAGbxClWenWDsirr5Ah562KWbAZLSVzPSVX6f0IKKwjUFWKL7IUUBew5B11jLwS5pvApHQYAGr09yIB1wJarr7X3CqtmtiJWqsb_-uiPl_VwoLyBBq90U_aHdzACuzoJfdZUBvKZHW"
              alt="Rustic wooden crate filled with vibrant organic vegetables"
              fill
              sizes="(max-width: 768px) 100vw, 42vw"
              className="object-cover opacity-90"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 p-6 bg-secondary-fixed rounded-full flex items-center justify-center text-on-secondary-fixed z-10 transform rotate-12">
            <Icon name="potted_plant" size="lg" />
          </div>
        </div>

        {/* Form + Results */}
        <div className="md:col-span-7 bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-ambient">
          <div className="mb-10">
            <h2 className="text-2xl font-headline text-tertiary italic mb-2">
              Check Order Status
            </h2>
            <p className="text-sm text-on-surface-variant">
              Please enter the details from your confirmation receipt.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <Input
              label="Order Number"
              type="text"
              placeholder="e.g. GRN-A3F8"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="text-lg rounded-t-lg"
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-lg rounded-t-lg"
            />

            <div className="pt-4 flex items-center gap-6">
              <Button
                type="submit"
                className="flex-grow md:flex-none px-8 py-4 rounded-lg flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icon name="progress_activity" size="sm" className="animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    Locate My Order
                    <Icon name="arrow_forward" size="sm" />
                  </>
                )}
              </Button>
              <a
                href="#"
                className="text-sm font-label text-secondary hover:underline underline-offset-4 transition-all"
              >
                Need help?
              </a>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-error/10 rounded-lg flex items-start gap-3">
              <Icon name="error" className="text-error shrink-0 mt-0.5" size="sm" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Order Result */}
          {order && statusConfig && (
            <div className="mt-8 space-y-6">
              {/* Status Banner */}
              <div className={`p-5 rounded-xl flex items-start gap-4 ${
                isTerminal && order.status !== "fulfilled"
                  ? "bg-error/10"
                  : "bg-primary-fixed/40"
              }`}>
                <div className={`p-2 rounded-full ${
                  isTerminal && order.status !== "fulfilled"
                    ? "bg-error/20"
                    : "bg-primary-fixed"
                }`}>
                  <Icon
                    name={statusConfig.icon}
                    className={
                      isTerminal && order.status !== "fulfilled"
                        ? "text-error"
                        : "text-primary"
                    }
                  />
                </div>
                <div>
                  <p className="font-headline text-lg text-tertiary">{statusConfig.label}</p>
                  <p className="text-sm text-on-surface-variant">{statusConfig.description}</p>
                </div>
              </div>

              {/* Progress Stepper */}
              {!isTerminal && (
                <div className="flex items-center gap-1">
                  {STATUS_STEPS.map((step, idx) => (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                        idx <= activeStepIndex
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-highest text-on-surface-variant"
                      }`}>
                        {idx < activeStepIndex ? (
                          <Icon name="check" size="sm" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-1 rounded transition-colors ${
                          idx < activeStepIndex ? "bg-primary" : "bg-surface-container-highest"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Items */}
              <div className="space-y-3">
                <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">
                  Items
                </p>
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.products?.image_url ? (
                      <Image
                        src={item.products.image_url}
                        alt={item.products.name ?? "Product"}
                        width={44}
                        height={44}
                        className="w-11 h-11 object-cover rounded-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-md bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                        <Icon name="eco" size="sm" className="text-on-surface-variant" />
                      </div>
                    )}
                    <div className="flex-grow">
                      <p className="text-sm font-bold text-on-surface">
                        {item.products?.name ?? "Product"}
                      </p>
                      <p className="text-xs text-on-surface-variant">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-tertiary">
                      ${(item.unit_price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2">
                <span className="font-label uppercase tracking-wider text-xs text-on-surface-variant">
                  Total
                </span>
                <span className="font-headline text-2xl text-primary">
                  ${order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quote Section */}
      <section className="mt-24 w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <span className="inline-block px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-tighter rounded-full mb-4">
            The Hearth Way
          </span>
          <h3 className="text-3xl font-headline text-tertiary mb-4 leading-snug italic">
            &ldquo;Every basket we pack is a promise of quality,
            sustainability, and community.&rdquo;
          </h3>
          <p className="text-on-surface-variant text-sm font-body leading-relaxed">
            Our farmers start harvesting at dawn to ensure that when your order
            is &lsquo;Ready for Pickup&rsquo;, it&rsquo;s as fresh as the
            morning dew.
          </p>
        </div>
        <div className="order-1 md:order-2">
          <div className="aspect-square bg-surface-container rounded-full flex items-center justify-center p-8">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKGUWMhnipmlTiPT5EMbMIwzpwsw0fVRr1eaPhawbMB0emhDApJMCndKQ77wF7uEdJ4tMeiZ5QGzsxT3tq7T4lsPUFpmIvyQUB0CB7S3SPBrUF_k2XcRxbS6QloiDxGDZZUAzlGVXg9n-jPdKdPT3xXZZJ4KpYD-21W88jzA5-rWF21qE0nS8UbRsldBAL7E7RdTtH4m0T9v4VQ1nbWxniutqVY3jVibZaAiW08Vf0tu9P1ueFDDvgkYfnRRlLX8u2kWAHd2q81BZm"
              alt="Smiling farmer holding a fresh loaf of artisan bread"
              width={400}
              height={400}
              sizes="(max-width: 768px) 100vw, 40vw"
              loading="lazy"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
