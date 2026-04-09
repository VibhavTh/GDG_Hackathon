"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent("Invalid email or password.")}`);
  }

  // Verify the user is actually an admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/admin/login?error=${encodeURIComponent("Sign in failed. Please try again.")}`);

  const service = createServiceClient();
  const { data: profile } = await service
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    redirect(`/admin/login?error=${encodeURIComponent("Access denied. Admin accounts only.")}`);
  }

  redirect("/admin");
}
