"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const service = createServiceClient();
  const { data: profile } = await service
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Not authorized");
  return { user, service };
}

export async function uploadGalleryPhoto(formData: FormData) {
  const { user, service } = await requireAdmin();

  const imageUrl = formData.get("image_url") as string;
  const caption = (formData.get("caption") as string)?.trim() || null;

  if (!imageUrl) {
    return { error: "No image URL provided." };
  }

  const { error } = await service.from("gallery_photos").insert({
    image_url: imageUrl,
    caption,
    uploaded_by: user.id,
  });

  if (error) {
    return { error: "Failed to save photo. Please try again." };
  }

  revalidatePath("/gallery");
  return { success: true };
}

export async function deleteGalleryPhoto(photoId: string) {
  const { service } = await requireAdmin();

  const { data: photo, error: fetchError } = await service
    .from("gallery_photos")
    .select("id, image_url")
    .eq("id", photoId)
    .single();

  if (fetchError || !photo) {
    return { error: "Photo not found." };
  }

  // Extract storage path from the public URL
  const urlParts = photo.image_url.split("/gallery-images/");
  if (urlParts[1]) {
    await service.storage.from("gallery-images").remove([urlParts[1]]);
  }

  const { error } = await service
    .from("gallery_photos")
    .delete()
    .eq("id", photoId);

  if (error) {
    return { error: "Failed to delete photo." };
  }

  revalidatePath("/gallery");
  return { success: true };
}
