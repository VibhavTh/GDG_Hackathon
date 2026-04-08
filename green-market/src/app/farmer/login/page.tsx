import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { login } from "./actions";

interface Props {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function FarmerLoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-surface">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <Icon name="potted_plant" fill className="text-on-primary-container" />
            </div>
            <span className="font-headline text-xl text-tertiary font-bold">Green Market</span>
          </Link>
          <h1 className="text-3xl font-headline italic text-tertiary mb-2">
            Farmer sign in
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Access your dashboard to manage listings and orders.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg font-body flex items-start gap-2">
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
                placeholder="farmer@greenmarket.farm"
                className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
                  Password
                </label>
                <Link href="/farmer/forgot-password" className="text-xs text-secondary hover:text-primary transition-colors font-body">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all"
            >
              Access Dashboard
            </button>
          </form>

          <p className="text-center text-xs text-on-surface-variant font-body">
            New here?{" "}
            <Link href="/farmer/register" className="text-primary font-bold hover:underline">
              Create an account
            </Link>
          </p>
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
