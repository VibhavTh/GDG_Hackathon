"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/supabase/types";

export async function saveOnboarding(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/farmer/login");

  const location = (formData.get("location") as string).trim();
  const description = (formData.get("description") as string).trim();
  const categories = formData.getAll("categories") as ProductCategory[];

  const { error } = await supabase
    .from("farms")
    .update({ location: location || null, description: description || null, categories })
    .eq("owner_id", user.id);

  if (error) {
    redirect(
      `/farmer/onboarding?error=${encodeURIComponent("Could not save your farm profile. Please try again.")}`
    );
  }

  redirect("/dashboard");
}
