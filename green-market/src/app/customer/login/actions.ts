"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function magicLink(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const next = (formData.get("next") as string) || "/account/orders";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Keep redirectTo clean — role and next are appended so callback can read them
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?role=customer&next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(
      `/customer/login?error=${encodeURIComponent("Couldn't send the link. Please try again.")}`
    );
  }

  redirect(
    `/customer/login?success=${encodeURIComponent(`Check your inbox. We sent a sign-in link to ${email}`)}`
  );
}

export async function googleSignIn(formData: FormData) {
  const supabase = await createClient();
  const next = (formData.get("next") as string) || "/account/orders";

  // Use a clean redirectTo — Supabase preserves it through the OAuth flow.
  // We append role=customer so the callback knows not to send them to /dashboard.
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?role=customer&next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      // Request only what we need
      scopes: "email profile",
    },
  });

  if (error || !data.url) {
    redirect(
      `/customer/login?error=${encodeURIComponent("Google sign-in failed. Please try again.")}`
    );
  }

  redirect(data.url);
}
