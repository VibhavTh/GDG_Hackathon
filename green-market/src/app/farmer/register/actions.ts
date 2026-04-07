"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function register(formData: FormData) {
  const supabase = await createClient();
  const service = createServiceClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const farmName = (formData.get("farm_name") as string).trim();

  if (!farmName) {
    redirect(
      `/farmer/register?error=${encodeURIComponent("Please enter your farm name.")}`
    );
  }

  // 1. Create auth user
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: { farm_name: farmName },
    },
  });

  if (signUpError) {
    const message =
      signUpError.message.toLowerCase().includes("already registered")
        ? "An account with that email already exists. Try logging in instead."
        : "We couldn't create your account. Please try again.";
    redirect(`/farmer/register?error=${encodeURIComponent(message)}`);
  }

  // Supabase silent duplicate: returns a user with no identities if the email
  // already exists but is unconfirmed. Treat this as "already registered".
  if (!data.user || data.user.identities?.length === 0) {
    redirect(
      `/farmer/register?error=${encodeURIComponent("An account with that email already exists. Try logging in instead.")}`
    );
  }

  const userId = data.user.id;

  // 2. Upsert public.users row — trigger may have already created it as 'customer'
  const { error: userError } = await service.from("users").upsert(
    { id: userId, email, role: "farmer" },
    { onConflict: "id" }
  );

  if (userError) {
    // Best-effort cleanup: delete the auth user so they can try again
    await service.auth.admin.deleteUser(userId);
    redirect(
      `/farmer/register?error=${encodeURIComponent("Something went wrong. Please try again.")}`
    );
  }

  // 3. Create farms row — check it doesn't already exist first
  const { data: existingFarm } = await service
    .from("farms")
    .select("id")
    .eq("owner_id", userId)
    .single();

  if (!existingFarm) {
    const { error: farmError } = await service.from("farms").insert({
      owner_id: userId,
      name: farmName,
      is_approved: false,
    });

    if (farmError) {
      // Roll back users row and auth user so the farmer can retry cleanly
      await service.from("users").delete().eq("id", userId);
      await service.auth.admin.deleteUser(userId);
      redirect(
        `/farmer/register?error=${encodeURIComponent("Something went wrong creating your farm. Please try again.")}`
      );
    }
  }

  redirect("/farmer/verify-email");
}
