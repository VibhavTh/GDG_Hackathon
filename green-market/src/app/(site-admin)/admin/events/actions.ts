"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function requireFarmOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const service = createServiceClient();
  const { data: profile } = await service.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "farmer" && profile?.role !== "admin") return null;
  return { user, service };
}

export async function createEvent(formData: FormData) {
  const auth = await requireFarmOwner();
  if (!auth) return;
  const { user, service } = auth;

  await service.from("events").insert({
    title: (formData.get("title") as string).trim(),
    description: ((formData.get("description") as string) || "").trim() || null,
    event_date: formData.get("event_date") as string,
    event_time: (formData.get("event_time") as string) || null,
    location: ((formData.get("location") as string) || "").trim() || null,
    created_by: user.id,
    is_published: true,
  });

  revalidatePath("/admin/events");
  revalidatePath("/");
}

export async function deleteEvent(id: string) {
  const service = createServiceClient();
  await service.from("events").delete().eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath("/");
}

export async function toggleEventPublished(id: string, publish: boolean) {
  const service = createServiceClient();
  await service.from("events").update({ is_published: publish }).eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath("/");
}
