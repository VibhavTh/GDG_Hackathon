"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";

interface Props {
  next?: string;
}

export function MagicLinkForm({ next }: Props) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?role=customer&next=${encodeURIComponent(next ?? "/account/orders")}`;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    setPending(false);

    if (otpError) {
      setError("Couldn't send the link. Please try again.");
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="bg-primary/10 text-primary text-sm px-4 py-3 rounded-lg font-body flex items-start gap-2 animate-slide-down">
        <Icon name="check_circle" size="sm" className="shrink-0 mt-0.5" />
        <span>Check your inbox -- we sent a sign-in link to {email}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg font-body flex items-start gap-2 animate-slide-down">
          <Icon name="error" size="sm" className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none focus:-translate-y-px transition-all duration-150"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-on-primary font-label font-bold py-3 rounded-xl hover:bg-primary/90 active:scale-[0.97] transition-all duration-150 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <Icon name="progress_activity" size="sm" className="animate-spin" />
            Sending...
          </>
        ) : (
          "Send Magic Link"
        )}
      </button>
    </form>
  );
}
