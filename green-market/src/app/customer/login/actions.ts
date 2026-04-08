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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}&role=customer`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(
      `/customer/login?error=${encodeURIComponent("Couldn't send the link. Please try again.")}`
    );
  }

  redirect(
    `/customer/login?success=${encodeURIComponent(`Check your inbox — we sent a sign-in link to ${email}`)}`
  );
}

export async function googleSignIn(formData: FormData) {
  const supabase = await createClient();
  const next = (formData.get("next") as string) || "/account/orders";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}&role=customer`,
    },
  });

  if (error || !data.url) {
    redirect(
      `/customer/login?error=${encodeURIComponent("Google sign-in failed. Please try again.")}`
    );
  }

  redirect(data.url);
}
