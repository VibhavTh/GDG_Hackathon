"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const [cardFocused, setCardFocused] = useState<string | null>(null);

  return (
    <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Customer Details Form */}
        <div className="lg:col-span-7 space-y-10">
          <header>
            <h1 className="font-headline text-5xl text-tertiary mb-2">
              Finalize Your Harvest
            </h1>
            <p className="text-on-surface-variant font-body italic text-lg">
              Just a few details to get these farm-fresh goods to you.
            </p>
          </header>

          <form className="space-y-8">
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
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="(555) 0123-456"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="silas@farmmail.com"
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
                <label className="relative flex items-center p-4 cursor-pointer bg-surface-container-highest rounded-lg has-[:checked]:bg-primary-fixed transition-all">
                  <input
                    defaultChecked
                    className="sr-only peer"
                    name="fulfillment"
                    type="radio"
                  />
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary-fixed-dim text-primary">
                      <Icon name="local_shipping" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Home Delivery</p>
                      <p className="text-xs text-on-surface-variant">
                        Delivered fresh to your door
                      </p>
                    </div>
                  </div>
                </label>

                <label className="relative flex items-center p-4 cursor-pointer bg-surface-container-highest rounded-lg has-[:checked]:bg-secondary-fixed transition-all">
                  <input
                    className="sr-only peer"
                    name="fulfillment"
                    type="radio"
                  />
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-secondary-fixed text-secondary">
                      <Icon name="storefront" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Farm Pickup</p>
                      <p className="text-xs text-on-surface-variant">
                        Collect at the South Gate stall
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-8 space-y-1">
                <label htmlFor="special-instructions" className="text-sm font-label uppercase tracking-widest text-on-surface-variant">
                  Notes for the Farmer
                </label>
                <textarea
                  id="special-instructions"
                  className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 text-on-surface resize-none"
                  placeholder="Leave the crate under the porch oak tree..."
                  rows={3}
                />
              </div>
            </section>

            {/* Payment */}
            <section className="bg-surface-container-low p-8 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline text-2xl text-tertiary">
                  Payment Details
                </h2>
                <div className="flex items-center gap-1.5 text-on-surface-variant/60">
                  <Icon name="lock" size="sm" />
                  <span className="text-[10px] font-label uppercase tracking-widest">
                    Secured by Stripe
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {/* Card Number */}
                <div className="space-y-1.5">
                  <label htmlFor="card-number" className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Card Number
                  </label>
                  <div
                    className={`flex items-center gap-3 bg-surface-container-highest border-0 border-b-2 transition-colors duration-300 py-3 ${
                      cardFocused === "number"
                        ? "border-primary"
                        : "border-outline-variant"
                    }`}
                  >
                    <Icon name="credit_card" size="sm" className="text-outline shrink-0" />
                    <input
                      id="card-number"
                      className="flex-1 bg-transparent focus:outline-none font-body text-on-surface placeholder:text-outline text-sm"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      autoComplete="cc-number"
                      inputMode="numeric"
                      onFocus={() => setCardFocused("number")}
                      onBlur={() => setCardFocused(null)}
                    />
                  </div>
                </div>

                {/* Expiry + CVC */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label htmlFor="card-expiry" className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Expiry Date
                    </label>
                    <input
                      id="card-expiry"
                      className={`w-full bg-surface-container-highest border-0 border-b-2 transition-colors duration-300 py-3 font-body text-on-surface placeholder:text-outline text-sm focus:outline-none ${
                        cardFocused === "expiry"
                          ? "border-primary"
                          : "border-outline-variant"
                      }`}
                      placeholder="MM / YY"
                      maxLength={7}
                      autoComplete="cc-exp"
                      inputMode="numeric"
                      onFocus={() => setCardFocused("expiry")}
                      onBlur={() => setCardFocused(null)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="card-cvc" className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      CVC
                    </label>
                    <input
                      id="card-cvc"
                      className={`w-full bg-surface-container-highest border-0 border-b-2 transition-colors duration-300 py-3 font-body text-on-surface placeholder:text-outline text-sm focus:outline-none ${
                        cardFocused === "cvc"
                          ? "border-primary"
                          : "border-outline-variant"
                      }`}
                      placeholder="•••"
                      maxLength={4}
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      onFocus={() => setCardFocused("cvc")}
                      onBlur={() => setCardFocused(null)}
                    />
                  </div>
                </div>

                {/* Name on Card */}
                <Input
                  label="Name on Card"
                  type="text"
                  placeholder="As it appears on your card"
                />
              </div>

              {/* Accepted cards */}
              <div className="mt-6 flex items-center gap-3">
                {["VISA", "MC", "AMEX"].map((card) => (
                  <span
                    key={card}
                    className="px-2.5 py-1 bg-surface-container-highest rounded text-[10px] font-bold font-label text-on-surface-variant tracking-wider"
                  >
                    {card}
                  </span>
                ))}
                <span className="text-[10px] text-on-surface-variant/50 font-body ml-1">
                  &amp; more
                </span>
              </div>
            </section>

            <Button className="w-full py-5 rounded-xl text-lg flex items-center justify-center gap-3">
              Place Your Order
              <Icon name="arrow_forward" />
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
                3 Items
              </span>
            </h3>

            <div className="space-y-6">
              {/* Cart Items */}
              {[
                {
                  name: "Heirloom Potatoes",
                  detail: "2.5 lbs · South Field",
                  price: "$8.50",
                  image:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDx8mJ4p0ZbTGVUYhRN2IQ1ndNAIHp4aet6nDbpOuOmU1bTasuUTqm4SWcJmw6GRAT0rxkHm9PBlLBA6OhxhVAH4ujjlAg1T2FnY5hdbQPysionSmGsY4GcTfFouq1iE3DRyv2lNBBfqdWR8CAe_isTDsgbDcWXbABKCfsMsRRwwk6Uqh6Gi5KvPPub8jqaxwjK32NOhELGjIhuT30As_4DR--fFLgB44w6xC2LcXEDCv5zuFZ91I-c5GvGTydE6yCpCoFzun3j7-T1",
                },
                {
                  name: "Wildflower Honey",
                  detail: "12oz Jar · Spring Harvest",
                  price: "$12.00",
                  image:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDTU96jiRMVnp9WiNamFnCl_9Df0j3calz7u3k2NBW_ppS6J4QUIOYcdLwSjtt3Th2teHhZeT5R9BBPncrqq3rm2D6MF_KhhNgQS1biMibcM36LdSacp5U2h_17zm2wV-BzX0z3Nx-vK9OH_UZ4Xnc7mNs3EY5j_4VAWl38XwuEpf99jVECtb5vYrELfQHbFP3becGFao10rkJPOdm6Wlg4q77rhmz0X4RdAkFHvNJosnrfyyr6FA608qlvxFxMCAp9QQdHel9Sgcq1",
                },
                {
                  name: "Morning Greens Mix",
                  detail: "Hand-picked today",
                  price: "$6.25",
                  image:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCmt4hrMM0l4AdaRFdA3ws5fLXYxI5ZCe-XpExi4RNBDk48b64BMoXQoCFoPFG1z8rG5J7_UQsUhVYNbT9CIgEHrnRmn7Z02t-rKAtq2TCnWBt1L-TuBfeI7n55crI3gZu3xaeo4VbyVVMx1csPG5J_qew8IUVXM38GfCXh3Wd1r6C3SY-0TGiugXpyPRQuNjd6XquLHsZ6vXX3Orcqn7Z2pOWhXCag-pvhHHU3oitlvjl7fuk9FGhYRdXYh88dmc1Igadm2d0cqRJw",
                },
              ].map((item) => (
                <div key={item.name} className="flex gap-4 items-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    sizes="80px"
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <h4 className="font-bold text-on-surface">{item.name}</h4>
                    <p className="text-sm text-on-surface-variant italic">
                      {item.detail}
                    </p>
                  </div>
                  <span className="font-headline text-xl text-tertiary">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-12 pt-8 bg-surface-container-low -mx-8 px-8 pb-2 space-y-3">
              <div className="flex justify-between text-on-surface-variant">
                <span className="font-label uppercase tracking-wider text-xs">
                  Subtotal
                </span>
                <span className="font-body">$26.75</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span className="font-label uppercase tracking-wider text-xs">
                  Fulfillment Fee
                </span>
                <span className="font-body">$4.00</span>
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
                    $30.75
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
