"use server";

import { revalidatePath, updateTag } from "next/cache";
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
  if (!auth) {
    console.error("[createEvent] not authorized (no farmer/admin session)");
    return { error: "Not authorized. Please sign in as the farm owner." };
  }
  const { user, service } = auth;

  const title = (formData.get("title") as string).trim();
  const description = ((formData.get("description") as string) || "").trim() || null;
  const location = ((formData.get("location") as string) || "").trim() || null;

  const startTimeRaw = ((formData.get("start_time") as string) || "").trim();
  const endTimeRaw = ((formData.get("end_time") as string) || "").trim();

  const row = {
    title,
    description,
    location,
    event_date: (formData.get("start_date") as string).trim(),
    event_time: startTimeRaw || "00:00:00",
    end_date: (formData.get("end_date") as string).trim(),
    end_time: endTimeRaw || "23:59:59",
    created_by: user.id,
    is_published: true,
  };

  const { data: inserted, error: insertError } = await service
    .from("events")
    .insert(row)
    .select("id, title")
    .single();

  if (insertError) {
    console.error("[createEvent] insert failed:", insertError);
    return { error: insertError.message };
  }

  // Fallback in case the create_album_for_event trigger isn't installed (dev envs).
  if (inserted) {
    const { error: albumError } = await service
      .from("albums")
      .upsert(
        { event_id: inserted.id, name: inserted.title },
        { onConflict: "event_id", ignoreDuplicates: true }
      );
    if (albumError) {
      console.error("[createEvent] album upsert failed:", albumError);
    }
  }

  updateTag("events");
  updateTag("dashboard");
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/gallery");
  revalidatePath("/");
  return { success: true };
}

export async function deleteEvent(id: string) {
  const service = createServiceClient();
  await service.from("events").delete().eq("id", id);
  updateTag("events");
  updateTag("dashboard");
  revalidatePath("/admin/events");
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function updateEvent(id: string, formData: FormData) {
  const auth = await requireFarmOwner();
  if (!auth) return;
  const { service } = auth;

  const eventTimeRaw = ((formData.get("event_time") as string) || "").trim();
  const endTimeRaw = ((formData.get("end_time") as string) || "").trim();

  await service.from("events").update({
    title: (formData.get("title") as string).trim(),
    description: ((formData.get("description") as string) || "").trim() || null,
    location: ((formData.get("location") as string) || "").trim() || null,
    event_date: (formData.get("event_date") as string).trim(),
    event_time: eventTimeRaw || "00:00:00",
    end_date: ((formData.get("end_date") as string) || "").trim() || null,
    end_time: endTimeRaw || "23:59:59",
  }).eq("id", id);

  updateTag("events");
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function toggleEventPublished(id: string, publish: boolean) {
  const service = createServiceClient();
  await service.from("events").update({ is_published: publish }).eq("id", id);
  updateTag("events");
  updateTag("dashboard");
  revalidatePath("/admin/events");
  revalidatePath("/");
}
