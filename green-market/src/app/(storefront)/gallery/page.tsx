import { Suspense } from "react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { GalleryHeader } from "./gallery-header";

export const metadata = {
  title: "Gallery | The Green Market Farm",
  description:
    "Photos from The Green Market Farm. Harvests, market days, and life on the farm.",
};

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

  const service = createServiceClient();
  const { data: photos } = await service
    .from("gallery_photos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <GalleryHeader userRole={userRole} />
      <GalleryGrid
        photos={photos ?? []}
        userRole={userRole}
        userId={user?.id ?? null}
      />
    </section>
  );
}
