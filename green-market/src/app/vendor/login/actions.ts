"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || "/dashboard";

  const FARM_OWNER_EMAIL = process.env.FARM_OWNER_EMAIL;
  if (FARM_OWNER_EMAIL && email.toLowerCase() !== FARM_OWNER_EMAIL.toLowerCase()) {
    redirect(`/vendor/login?error=${encodeURIComponent("Access restricted. This login is for farm staff only.")}`);
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const params = new URLSearchParams({ error: "We couldn't find an account with those details. Double-check your email and password." });
    if (next !== "/dashboard") params.set("next", next);
    redirect(`/vendor/login?${params.toString()}`);
  }

  redirect(next);
}
