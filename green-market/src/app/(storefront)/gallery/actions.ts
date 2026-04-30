"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isActiveAlbum } from "@/lib/queries/albums";

type Role = "customer" | "farmer" | "admin";

async function requireUser() {
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

  const role = (profile?.role ?? "customer") as Role;
  return { user, service, role };
}

export async function uploadGalleryPhoto(formData: FormData) {
  const auth = await requireUser();
  if (!auth) return { error: "Please sign in to upload photos." };
  const { user, service, role } = auth;

  const imageUrl = (formData.get("image_url") as string) || "";
  const caption = (formData.get("caption") as string)?.trim() || null;
  const albumId = (formData.get("album_id") as string) || "";

  if (!imageUrl) return { error: "No image URL provided." };
  if (!albumId) return { error: "Missing album." };

  const { data: album } = await service
    .from("albums")
    .select("id")
    .eq("id", albumId)
    .single();
  if (!album) return { error: "Album not found." };

  if (role === "customer") {
    const allowed = await isActiveAlbum(albumId);
    if (!allowed) {
      return { error: "You can only upload to the current event's album." };
    }
  }

  const { error } = await service.from("gallery_photos").insert({
    image_url: imageUrl,
    caption,
    uploaded_by: user.id,
    album_id: albumId,
  });

  if (error) {
    return { error: "Failed to save photo. Please try again." };
  }

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${albumId}`);
  return { success: true };
}

export async function deleteGalleryPhoto(photoId: string) {
  const auth = await requireUser();
  if (!auth) return { error: "Please sign in." };
  const { user, service, role } = auth;

  const { data: photo, error: fetchError } = await service
    .from("gallery_photos")
    .select("id, image_url, uploaded_by, album_id")
    .eq("id", photoId)
    .single();

  if (fetchError || !photo) return { error: "Photo not found." };

  const isOwner = photo.uploaded_by === user.id;
  const isFarmer = role === "farmer" || role === "admin";
  if (!isOwner && !isFarmer) {
    return { error: "You can only delete your own photos." };
  }

  const urlParts = photo.image_url.split("/gallery-images/");
  if (urlParts[1]) {
    await service.storage.from("gallery-images").remove([urlParts[1]]);
  }

  // Clear cover if this photo was used as one.
  await service
    .from("albums")
    .update({ cover_photo_id: null })
    .eq("cover_photo_id", photoId);

  const { error } = await service
    .from("gallery_photos")
    .delete()
    .eq("id", photoId);

  if (error) return { error: "Failed to delete photo." };

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${photo.album_id}`);
  return { success: true };
}

export async function setAlbumCover(albumId: string, photoId: string) {
  const auth = await requireUser();
  if (!auth) return { error: "Please sign in." };
  if (auth.role !== "farmer" && auth.role !== "admin") {
    return { error: "Not authorized." };
  }

  const { error } = await auth.service
    .from("albums")
    .update({ cover_photo_id: photoId, updated_at: new Date().toISOString() })
    .eq("id", albumId);

  if (error) return { error: "Failed to update cover." };

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${albumId}`);
  return { success: true };
}
