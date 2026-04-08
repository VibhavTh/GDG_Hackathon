"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function register(formData: FormData) {
  const supabase = await createClient();
  const service = createServiceClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (signUpError) {
    const message = signUpError.message.toLowerCase().includes("already registered")
      ? "An account with that email already exists. Try logging in instead."
      : signUpError.message;
    redirect(`/farmer/register?error=${encodeURIComponent(message)}`);
  }

  // Silent duplicate: Supabase returns a user with no identities for unconfirmed existing emails
  if (!data.user || data.user.identities?.length === 0) {
    redirect(
      `/farmer/register?error=${encodeURIComponent("An account with that email already exists. Try logging in instead.")}`
    );
  }

  const userId = data.user.id;

  // Upsert users row with farmer role
  const { error: userError } = await service.from("users").upsert(
    { id: userId, email, role: "farmer" },
    { onConflict: "id" }
  );

  if (userError) {
    await service.auth.admin.deleteUser(userId);
    redirect(
      `/farmer/register?error=${encodeURIComponent("Something went wrong. Please try again.")}`
    );
  }

  redirect("/farmer/verify-email");
}
