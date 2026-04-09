import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SubmitButton } from "@/components/ui/submit-button";
import { register } from "./actions";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function VendorRegisterPage({ searchParams }: Props) {
  const { error } = await searchParams;

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
            Create your vendor account
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            List products, manage orders, and reach local customers.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg font-body flex items-start gap-2 animate-slide-down">
              <Icon name="error" size="sm" className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form action={register} className="space-y-5">
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
              <label htmlFor="password" className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none focus:-translate-y-px transition-all duration-150"
              />
            </div>

            <div className="flex items-start gap-3 bg-surface-container rounded-lg px-4 py-3">
              <Icon name="mail" size="sm" className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-on-surface-variant font-body leading-relaxed">
                We will send a confirmation link to your email. After confirming, you will set up your farm profile.
              </p>
            </div>

            <SubmitButton label="Create Account" loadingLabel="Creating account..." />
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-on-surface-variant font-label">or</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          <Link
            href="/vendor/login"
            className="block w-full text-center bg-surface-container text-primary py-3 rounded-xl font-bold text-sm hover:bg-surface-container-high active:scale-[0.97] transition-all duration-150"
          >
            Already have an account
          </Link>
        </div>

        <p className="text-center mt-6 text-sm text-on-surface-variant font-body">
          Looking to shop?{" "}
          <Link href="/customer/login" className="text-primary font-bold hover:underline">
            Customer sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
