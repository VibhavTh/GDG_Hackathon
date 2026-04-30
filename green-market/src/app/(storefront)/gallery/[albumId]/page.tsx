import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { GalleryHeader } from "../gallery-header";
import {
  getActiveAlbum,
  getAlbumById,
  getAlbumPhotos,
} from "@/lib/queries/albums";
import { Icon } from "@/components/ui/icon";

interface Props {
  params: Promise<{ albumId: string }>;
}

export default function AlbumPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <AlbumContent params={params} />
    </Suspense>
  );
}

async function AlbumContent({ params }: Props) {
  const { albumId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: "vendor" | "customer" | "admin" | null = null;
  if (user) {
    const service = createServiceClient();
    const { data: profile } = await service
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role === "farmer") userRole = "vendor";
    else if (profile?.role === "customer") userRole = "customer";
    else if (profile?.role === "admin") userRole = "admin";
  }

  const isFarmer = userRole === "vendor" || userRole === "admin";

  // Customers and anonymous visitors can only view the active album.
  if (!isFarmer) {
    const active = await getActiveAlbum();
    if (!active || active.album.id !== albumId) {
      redirect("/gallery");
    }
  }

  const album = await getAlbumById(albumId);
  if (!album) notFound();

  const photos = await getAlbumPhotos(albumId);
  const title = album.event?.title ?? album.album.name;

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
      {isFarmer && (
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-tertiary font-label text-xs uppercase tracking-widest mb-8 transition-colors"
        >
          <Icon name="arrow_back" size="sm" />
          All albums
        </Link>
      )}

      <GalleryHeader
        userRole={userRole}
        albumId={albumId}
        canUpload={!!user}
        eventTitle={title}
      />

      <GalleryGrid
        photos={photos}
        userRole={userRole}
        currentUserId={user?.id ?? null}
        albumId={albumId}
        coverPhotoId={album.album.cover_photo_id}
      />
    </section>
  );
}
