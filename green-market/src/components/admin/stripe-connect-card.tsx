"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

interface Props {
  stripeAccountId: string | null;
  onboardingComplete: boolean;
  payoutsEnabled: boolean;
}

export function StripeConnectCard({
  stripeAccountId,
  onboardingComplete,
  payoutsEnabled,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function callConnectEndpoint(method: "GET" | "POST", fallback: string) {
    setLoading(true);
    let res: Response;
    try {
      res = await fetch("/api/connect/account", { method });
    } catch {
      alert("Network error. Please check your connection and try again.");
      setLoading(false);
      return;
    }

    let data: { url?: string; error?: string } | null = null;
    try {
      data = await res.json();
    } catch {
      // Response was not JSON -- likely an unhandled 500 HTML error page
      alert(`Server error (${res.status}). Check the dev server logs for details.`);
      setLoading(false);
      return;
    }

    if (res.ok && data?.url) {
      window.location.href = data.url;
      return;
    }

    alert(data?.error ?? fallback);
    setLoading(false);
  }

  async function handleConnect() {
    await callConnectEndpoint("POST", "Failed to start Stripe onboarding");
  }

  async function handleContinueOnboarding() {
    await callConnectEndpoint("GET", "Failed to create onboarding link");
  }

  // State 1: No Stripe account
  if (!stripeAccountId) {
    return (
      <div className="bg-surface-container-low rounded-xl p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
            <Icon name="account_balance" className="text-primary text-2xl" />
          </div>
          <div className="flex-grow">
            <h2 className="font-headline text-xl text-tertiary mb-2">
              Set Up Payments
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Connect your Stripe account to start receiving payouts from
              customer orders. This takes about 5 minutes.
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connecting..." : "Connect with Stripe"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Account created but onboarding incomplete
  if (!onboardingComplete) {
    return (
      <div className="bg-amber-50 rounded-xl p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Icon name="pending" className="text-amber-600 text-2xl" />
          </div>
          <div className="flex-grow">
            <h2 className="font-headline text-xl text-tertiary mb-2">
              Complete Stripe Setup
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Your Stripe account was created but setup is not complete. Finish
              onboarding to start receiving payments.
            </p>
            <button
              onClick={handleContinueOnboarding}
              disabled={loading}
              className="bg-amber-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Complete Setup"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Onboarded but payouts disabled (re-verification needed)
  if (!payoutsEnabled) {
    return (
      <div className="bg-red-50 rounded-xl p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Icon name="warning" className="text-error text-2xl" />
          </div>
          <div className="flex-grow">
            <h2 className="font-headline text-xl text-tertiary mb-2">
              Payouts Paused
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Stripe needs additional information to keep your payouts active.
              Please update your details to resume receiving payments.
            </p>
            <button
              onClick={handleContinueOnboarding}
              disabled={loading}
              className="bg-error text-on-error px-6 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Update Details"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Fully active
  return (
    <div className="bg-surface-container-low rounded-xl p-8 mb-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
          <Icon name="check_circle" className="text-primary text-2xl" />
        </div>
        <div className="flex-grow">
          <h2 className="font-headline text-xl text-tertiary mb-2">
            Payouts Active
          </h2>
          <p className="text-sm text-on-surface-variant mb-4">
            Your Stripe account is connected and payouts are enabled. Customer
            payments will be deposited to your bank account.
          </p>
          <a
            href="/api/connect/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <Icon name="open_in_new" size="sm" />
            View Stripe Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
