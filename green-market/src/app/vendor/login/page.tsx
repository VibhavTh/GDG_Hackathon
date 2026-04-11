import { Suspense } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SubmitButton } from "@/components/ui/submit-button";
import { PasswordInput } from "@/components/ui/password-input";
import { login } from "./actions";
import { FarmerGoogleButton } from "./google-button";

interface Props {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default function VendorLoginPage({ searchParams }: Props) {
  return (
    <Suspense fallback={null}>
      <VendorLoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function VendorLoginContent({ searchParams }: Props) {
  const { error, next } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-surface">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-70 transition-opacity duration-150">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <Icon name="potted_plant" fill className="text-on-primary-container" />
            </div>
            <span className="font-headline text-xl text-tertiary font-bold">Green Market</span>
          </Link>
          <h1 className="text-3xl font-headline italic text-tertiary mb-2">
            Farm sign in
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Access your dashboard to manage listings and orders.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg font-body flex items-start gap-2 animate-slide-down">
              <Icon name="error" size="sm" className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form action={login} className="space-y-5">
            {next && <input type="hidden" name="next" value={next} />}

            <div>
              <label htmlFor="email" className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none focus:-translate-y-px transition-all duration-150"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
                  Password
                </label>
                <Link href="/vendor/forgot-password" className="text-xs text-secondary hover:text-primary transition-colors duration-150 font-body">
                  Forgot?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none focus:-translate-y-px transition-all duration-150"
              />
            </div>

            <SubmitButton label="Access Dashboard" loadingLabel="Signing in..." />
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-on-surface-variant font-label">or</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          <FarmerGoogleButton next={next} />

          <p className="text-center text-xs text-on-surface-variant font-body">
            Looking to shop?{" "}
            <Link href="/customer/login" className="text-primary font-bold hover:underline">
              Customer sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
