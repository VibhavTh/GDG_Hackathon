"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/supabase/types";

export async function setupFarm(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/farmer/login");

  const service = createServiceClient();

  const farmName = (formData.get("farm_name") as string).trim();
  const location = (formData.get("location") as string).trim();
  const description = (formData.get("description") as string).trim();
  const categories = formData.getAll("categories") as ProductCategory[];

  if (!farmName) {
    redirect(
      `/farmer/setup?error=${encodeURIComponent("Farm name is required.")}`
    );
  }

  // Idempotency guard: if a farms row already exists, update it
  const { data: existing } = await service
    .from("farms")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (existing) {
    const { error } = await service
      .from("farms")
      .update({
        name: farmName,
        location: location || null,
        description: description || null,
        categories,
      })
      .eq("owner_id", user.id);

    if (error) {
      redirect(
        `/farmer/setup?error=${encodeURIComponent("Could not save your farm. Please try again.")}`
      );
    }
    redirect("/dashboard");
  }

  const { error } = await service.from("farms").insert({
    owner_id: user.id,
    name: farmName,
    location: location || null,
    description: description || null,
    categories,
    is_approved: false,
  });

  if (error) {
    redirect(
      `/farmer/setup?error=${encodeURIComponent("Could not create your farm. Please try again.")}`
    );
  }

  redirect("/dashboard");
}
