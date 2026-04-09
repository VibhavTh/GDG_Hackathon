import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/icon";
import { MagicLinkForm } from "./magic-link-form";
import { googleSignIn } from "./actions";

interface Props {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function CustomerLoginPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error, next } = await searchParams;
  if (user) redirect(next ?? "/account/orders");

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
            Sign in to your account
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Track your orders and save your details for next time.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg font-body flex items-start gap-2 animate-slide-down">
              <Icon name="error" size="sm" className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth */}
          <form action={googleSignIn}>
            {next && <input type="hidden" name="next" value={next} />}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-surface-container-highest hover:bg-surface-container-high hover:-translate-y-px text-on-surface font-medium py-3 rounded-xl transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] active:translate-y-0 text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-on-surface-variant font-label">or</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {/* Magic link */}
          <MagicLinkForm next={next} />

          <p className="text-center text-xs text-on-surface-variant font-body">
            We&rsquo;ll email you a link to sign in instantly. No password needed.
          </p>
        </div>

        <p className="text-center mt-6 text-sm text-on-surface-variant font-body">
          Are you a vendor?{" "}
          <Link href="/vendor/login" className="text-primary font-bold hover:underline">
            Vendor sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
