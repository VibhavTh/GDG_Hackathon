"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore();

  // Hydration guard — Zustand persist uses localStorage (not available on server)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Redirect if cart is empty after hydration
  useEffect(() => {
    if (mounted && cart.items.length === 0) {
      router.replace("/products");
    }
  }, [mounted, cart.items.length, router]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState<"preorder" | "pickup">("pickup");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Pre-fill email and capture customer_id if logged in
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCustomerId(user.id);
        if (!customerEmail) setCustomerEmail(user.email ?? "");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = mounted ? cart.subtotal() : 0;
  const total = subtotal;
  const itemCount = mounted ? cart.itemCount() : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          fulfillmentType,
          specialInstructions: cart.specialInstructions,
          customerId,
          items: cart.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
            image: item.image ?? "",
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Redirect to Stripe Checkout — cart is cleared on the confirmation page
      window.location.href = data.url;
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Customer Details Form */}
        <div className="lg:col-span-7 space-y-10">
          <header>
            <h1 className="font-headline text-5xl text-tertiary mb-2">
              Review Your Order
            </h1>
            <p className="text-on-surface-variant font-body italic text-lg">
              Just a few details to get these farm-fresh goods to you.
            </p>
          </header>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Personal Info */}
            <section className="bg-surface-container-low p-8 rounded-xl">
              <h2 className="font-headline text-2xl text-tertiary mb-6">
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="e.g. Silas Thorne"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="(555) 0123-456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="silas@farmmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Fulfillment */}
            <section className="bg-surface-container-low p-8 rounded-xl">
              <h2 className="font-headline text-2xl text-tertiary mb-6">
                How would you like your goods?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`relative flex items-center p-4 cursor-pointer rounded-lg transition-all ${
                    fulfillmentType === "preorder"
                      ? "bg-primary-fixed"
                      : "bg-surface-container-highest"
                  }`}
                  onClick={() => setFulfillmentType("preorder")}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary-fixed-dim text-primary">
                      <Icon name="event_available" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Preorder Pickup</p>
                      <p className="text-xs text-on-surface-variant">
                        Pick up Wednesday or Saturday at the market · Free
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`relative flex items-center p-4 cursor-pointer rounded-lg transition-all ${
                    fulfillmentType === "pickup"
                      ? "bg-secondary-fixed"
                      : "bg-surface-container-highest"
                  }`}
                  onClick={() => setFulfillmentType("pickup")}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-secondary-fixed text-secondary">
                      <Icon name="storefront" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Market Pickup</p>
                      <p className="text-xs text-on-surface-variant">
                        Collect at the Blacksburg Farmers Market stall · Free
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-8 space-y-1">
                <label
                  htmlFor="special-instructions"
                  className="text-sm font-label uppercase tracking-widest text-on-surface-variant"
                >
                  Notes for the Vendor
                </label>
                <textarea
                  id="special-instructions"
                  className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 text-on-surface resize-none"
                  placeholder="Leave the crate under the porch oak tree..."
                  rows={3}
                  maxLength={500}
                  value={cart.specialInstructions}
                  onChange={(e) => cart.setSpecialInstructions(e.target.value)}
                />
                {cart.specialInstructions.length > 400 && (
                  <p className="text-xs text-on-surface-variant text-right mt-1">
                    {500 - cart.specialInstructions.length} characters remaining
                  </p>
                )}
              </div>
            </section>

            {/* Payment — redirect to Stripe */}
            <section className="bg-surface-container-low p-8 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline text-2xl text-tertiary">
                  Payment
                </h2>
                <div className="flex items-center gap-1.5 text-on-surface-variant/60">
                  <Icon name="lock" size="sm" />
                  <span className="text-[10px] font-label uppercase tracking-widest">
                    Secured by Stripe
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-surface-container-highest rounded-lg">
                <div className="p-2 rounded-full bg-primary-fixed mt-0.5">
                  <Icon name="credit_card" size="sm" className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    You&rsquo;ll be redirected to Stripe to complete payment
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Your card details are entered on Stripe&rsquo;s secure page and never stored on our servers.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 flex-wrap">
                {["VISA", "MC", "AMEX", "Apple Pay", "Google Pay"].map((method) => (
                  <span
                    key={method}
                    className="px-2.5 py-1 bg-surface-container-highest rounded text-[10px] font-bold font-label text-on-surface-variant tracking-wider"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </section>

            {error && (
              <div className="p-4 bg-error/10 rounded-lg flex items-start gap-3">
                <Icon name="error" className="text-error shrink-0 mt-0.5" size="sm" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-5 rounded-xl text-lg flex items-center justify-center gap-3"
              disabled={isSubmitting || !mounted}
            >
              {isSubmitting ? (
                <>
                  <Icon name="progress_activity" size="sm" className="animate-spin" />
                  Redirecting to payment...
                </>
              ) : (
                <>
                  Place Your Order
                  <Icon name="arrow_forward" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <aside className="lg:col-span-5 sticky top-32">
          <div className="bg-surface-container rounded-2xl p-8 overflow-hidden relative">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle,transparent_20%,#f1eee5_100%)]" />

            <h3 className="font-headline text-3xl text-tertiary mb-8 flex items-center justify-between">
              Order Basket
              <span className="text-sm font-body font-normal text-on-surface-variant">
                {mounted ? `${itemCount} Item${itemCount !== 1 ? "s" : ""}` : "—"}
              </span>
            </h3>

            <div className="space-y-6">
              {mounted && cart.items.length > 0 && cart.items.map((item) => (
                <div key={item.productId} className="flex gap-4 items-center mb-4">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      sizes="80px"
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg flex-shrink-0 bg-surface-container-highest flex items-center justify-center">
                      <Icon name="shopping_basket" className="text-on-surface-variant" />
                    </div>
                  )}
                  <div className="flex-grow">
                    <h4 className="font-bold text-on-surface">{item.name}</h4>
                    <p className="text-sm text-on-surface-variant italic">
                      {item.quantity} x {item.unit}
                    </p>
                  </div>
                  <span className="font-headline text-xl text-tertiary">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              {!mounted && (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-4 items-center animate-pulse">
                      <div className="w-20 h-20 rounded-lg bg-surface-container-highest flex-shrink-0" />
                      <div className="flex-grow space-y-2">
                        <div className="h-3 bg-surface-container-highest rounded w-3/4" />
                        <div className="h-2 bg-surface-container-highest rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="mt-12 pt-8 bg-surface-container-low -mx-8 px-8 pb-2 space-y-3">
              <div className="flex justify-between text-on-surface-variant">
                <span className="font-label uppercase tracking-wider text-xs">
                  Subtotal
                </span>
                <span className="font-body">
                  {mounted ? `$${subtotal.toFixed(2)}` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span className="font-label uppercase tracking-wider text-xs">
                  Pickup
                </span>
                <span className="font-body text-primary font-semibold">Free</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="font-headline text-2xl text-tertiary">
                  Total
                </span>
                <div className="text-right">
                  <span className="block text-xs text-secondary font-bold uppercase tracking-tighter">
                    Due Now
                  </span>
                  <span className="font-headline text-4xl text-primary">
                    {mounted ? `$${total.toFixed(2)}` : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Seal */}
            <div className="mt-8 p-4 bg-surface-container-highest rounded-lg flex items-start gap-3">
              <Icon name="verified" className="text-primary" />
              <div>
                <p className="text-xs font-bold text-on-surface uppercase tracking-tight">
                  Farmer&rsquo;s Guarantee
                </p>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  Grown without synthetic pesticides. Hand-picked and packed with
                  care at our local farmstead.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
