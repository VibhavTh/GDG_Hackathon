"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/supabase/types";

export async function updateFarmSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "Farm name is required." };
  }

  const description = (formData.get("description") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const image_url = (formData.get("image_url") as string)?.trim() || null;
  const categories = formData.getAll("categories") as ProductCategory[];

  const service = createServiceClient();
  const { error } = await service
    .from("farms")
    .update({ name, description, location, image_url, categories, updated_at: new Date().toISOString() })
    .eq("owner_id", user.id);

  if (error) {
    return { error: "Could not save changes. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
