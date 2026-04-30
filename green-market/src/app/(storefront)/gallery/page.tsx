import { Suspense } from "react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { AlbumsOverview } from "@/components/gallery/albums-overview";
import { GalleryHeader } from "./gallery-header";
import {
  getActiveAlbum,
  getAlbumPhotos,
  getAllAlbumsWithStats,
} from "@/lib/queries/albums";

export const metadata = {
  title: "Gallery | Green Market Farms",
  description:
    "Photos from Green Market Farms. Harvests, market days, and life on the farm.",
};

type ResolvedRole = "vendor" | "customer" | "admin" | null;

export default function GalleryPage() {
  return (
    <Suspense fallback={null}>
      <GalleryContent />
    </Suspense>
  );
}

async function GalleryContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: ResolvedRole = null;
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

  if (isFarmer) {
    const albums = await getAllAlbumsWithStats();
    return (
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <GalleryHeader userRole={userRole} albumId={null} canUpload={false} />
        <AlbumsOverview albums={albums} />
      </section>
    );
  }

  const active = await getActiveAlbum();
  const photos = active ? await getAlbumPhotos(active.album.id) : [];
  const canUpload = !!user && !!active;

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <GalleryHeader
        userRole={userRole}
        albumId={active?.album.id ?? null}
        canUpload={canUpload}
        eventTitle={active?.event?.title ?? null}
      />
      {!active ? (
        <EmptyNoEvents />
      ) : (
        <GalleryGrid
          photos={photos}
          userRole={userRole}
          currentUserId={user?.id ?? null}
        />
      )}
    </section>
  );
}

function EmptyNoEvents() {
  return (
    <div className="py-24 text-center bg-surface-container-low rounded-2xl">
      <p className="font-headline italic text-2xl text-tertiary mb-2">
        No events yet.
      </p>
      <p className="text-on-surface-variant font-body">
        Photos will appear here once the farm posts an event.
      </p>
    </div>
  );
}
