"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/supabase/types";

export async function setupFarm(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const service = createServiceClient();

  const farmName = (formData.get("farm_name") as string).trim();
  const location = (formData.get("location") as string).trim();
  const description = (formData.get("description") as string).trim();
  const categories = formData.getAll("categories") as ProductCategory[];

  if (!farmName) {
    redirect(
      `/vendor/setup?error=${encodeURIComponent("Farm name is required.")}`
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
        `/vendor/setup?error=${encodeURIComponent("Could not save your farm. Please try again.")}`
      );
    }
    redirect("/dashboard");
  }

  const { error, data: newFarm } = await service.from("farms").insert({
    owner_id: user.id,
    name: farmName,
    location: location || null,
    description: description || null,
    categories,
    is_approved: false,
  }).select("id").single();

  if (error) {
    redirect(
      `/vendor/setup?error=${encodeURIComponent("Could not create your farm. Please try again.")}`
    );
  }

  // Send vendor request to admin inbox
  await service.from("admin_messages").insert({
    type: "vendor_request",
    from_name: farmName,
    from_email: user.email ?? "",
    subject: `New vendor application: ${farmName}`,
    body: `${farmName} has submitted a vendor application and is awaiting approval.\n\nLocation: ${location || "not provided"}\nDescription: ${description || "not provided"}\nCategories: ${categories.join(", ") || "none selected"}`,
    metadata: {
      farm_id: newFarm?.id,
      owner_id: user.id,
      shop_name: farmName,
    },
  });

  redirect("/dashboard");
}
