import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/icon";
import { MagicLinkForm } from "./magic-link-form";
import { GoogleButton } from "./google-button";

interface Props {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default function CustomerLoginPage({ searchParams }: Props) {
  return (
    <Suspense fallback={null}>
      <CustomerLoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CustomerLoginContent({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error, next } = await searchParams;
  if (user) redirect(next ?? "/account");

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
          <GoogleButton next={next} />

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
          Are you the farmer?{" "}
          <Link href="/vendor/login" className="text-primary font-bold hover:underline">
            Farmer sign in
          </Link>
        </p>

        <p className="text-center mt-3 text-xs text-on-surface-variant/40 font-body">
          <Link href="/admin/login" className="hover:text-on-surface-variant transition-colors">
            Admin access
          </Link>
        </p>
      </div>
    </div>
  );
}
