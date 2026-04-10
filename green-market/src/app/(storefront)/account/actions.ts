"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function upgradeToVendor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/customer/login");

  const service = createServiceClient();

  // Upsert users row with vendor role (handles both existing customers and magic-link users with no row)
  const { error: roleError } = await service
    .from("users")
    .upsert({ id: user.id, email: user.email!, role: "farmer" }, { onConflict: "id" });

  if (roleError) {
    redirect(`/account?error=${encodeURIComponent("Something went wrong. Please try again.")}`);
  }

  // Create a placeholder farm row if one doesn't already exist
  const { data: existingFarm } = await service
    .from("farms")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!existingFarm) {
    await service.from("farms").insert({ owner_id: user.id });
  }

  redirect("/vendor/setup");
}
