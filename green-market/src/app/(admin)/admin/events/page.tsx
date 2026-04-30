import { Suspense } from "react";
import { createServiceClient } from "@/lib/supabase/server";
import { EventForm } from "./event-form";
import { EventListClient } from "./event-list-client";
import { LocationStatusList } from "./location-status-list";
import { getLocationStatuses, LOCATION_DEFINITIONS } from "@/lib/queries/location-statuses";

export default function AdminEventsPage() {
  return (
    <Suspense fallback={null}>
      <AdminEventsContent />
    </Suspense>
  );
}

async function AdminEventsContent() {
  const service = createServiceClient();

  const { data: events } = await service
    .from("events")
    .select("*, albums(id)")
    .order("event_date", { ascending: true });

  const normalised = (events ?? []).map((e) => {
    const albums = e.albums as { id: string }[] | { id: string } | null;
    const albumId = Array.isArray(albums) ? albums[0]?.id ?? null : albums?.id ?? null;
    return { ...e, album_id: albumId };
  });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = normalised.filter((e) => e.event_date >= today);
  const past = normalised.filter((e) => e.event_date < today);

  const statuses = await getLocationStatuses();

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <header className="mb-10">
        <h1 className="font-headline italic text-4xl text-tertiary mb-2">Events</h1>
        <p className="text-on-surface-variant text-sm">
          Published events appear on the storefront homepage calendar.
        </p>
      </header>

      {/* Create event form */}
      <section className="mb-12 bg-surface-container-low rounded-2xl p-8">
        <h2 className="font-headline text-xl text-tertiary font-bold mb-6">Add New Event</h2>
        <EventForm />
      </section>

      <EventListClient upcoming={upcoming} past={past} />

      <section className="mt-16">
        <header className="mb-6">
          <span className="text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-2 block">
            Storefront
          </span>
          <h2 className="font-headline italic text-3xl text-tertiary">
            Location statuses
          </h2>
          <p className="text-on-surface-variant text-sm mt-2 max-w-[55ch]">
            Flip these as the seasons turn. The tag and note on the Events page update right after you save.
          </p>
        </header>
        <LocationStatusList definitions={LOCATION_DEFINITIONS} statuses={statuses} />
      </section>
    </div>
  );
}
