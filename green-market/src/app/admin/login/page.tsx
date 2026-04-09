import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SubmitButton } from "@/components/ui/submit-button";
import { adminLogin } from "./actions";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-surface">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-70 transition-opacity duration-150">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <Icon name="admin_panel_settings" className="text-on-primary-container" />
            </div>
            <span className="font-headline text-xl text-tertiary font-bold">Green Market</span>
          </Link>
          <h1 className="text-3xl font-headline italic text-tertiary mb-2">
            Admin sign in
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Restricted access. Authorized personnel only.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg font-body flex items-start gap-2 animate-slide-down">
              <Icon name="error" size="sm" className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form action={adminLogin} className="space-y-5">
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
                placeholder="admin@example.com"
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
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none focus:-translate-y-px transition-all duration-150"
              />
            </div>

            <SubmitButton label="Access Admin Panel" loadingLabel="Signing in..." />
          </form>

          <p className="text-center text-xs text-on-surface-variant font-body pt-2">
            <Link href="/" className="text-primary hover:underline">Back to storefront</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
