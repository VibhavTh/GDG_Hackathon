"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  LOCATION_DEFINITIONS,
  STATUS_OPTIONS,
  type StatusValue,
} from "@/lib/queries/location-statuses-shared";

const VALID_SLUGS = new Set<string>(LOCATION_DEFINITIONS.map((l) => l.slug));
const VALID_STATUSES = new Set(STATUS_OPTIONS.map((o) => o.value));

async function requireFarmOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const service = createServiceClient();
  const { data: profile } = await service
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "farmer" && profile?.role !== "admin") return null;
  return { user, service };
}

export async function updateLocationStatus(formData: FormData) {
  const auth = await requireFarmOwner();
  if (!auth) return { error: "Not authorized." };
  const { service } = auth;

  const slug = (formData.get("slug") as string) || "";
  const status = (formData.get("status") as string) || "";
  const note = ((formData.get("note") as string) || "").trim() || null;

  if (!VALID_SLUGS.has(slug)) return { error: "Unknown location." };
  if (!VALID_STATUSES.has(status as StatusValue)) {
    return { error: "Unknown status." };
  }

  const { error } = await service
    .from("location_statuses")
    .upsert({ slug, status, note }, { onConflict: "slug" });

  if (error) {
    console.error("[updateLocationStatus] failed:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { success: true };
}
