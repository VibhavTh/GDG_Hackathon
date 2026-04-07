"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm_password") as string;

  if (password !== confirm) {
    redirect(
      `/farmer/reset-password?error=${encodeURIComponent("Passwords do not match.")}`
    );
  }

  if (password.length < 8) {
    redirect(
      `/farmer/reset-password?error=${encodeURIComponent("Password must be at least 8 characters.")}`
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(
      `/farmer/reset-password?error=${encodeURIComponent("Could not update your password. The reset link may have expired.")}`
    );
  }

  redirect("/dashboard");
}
