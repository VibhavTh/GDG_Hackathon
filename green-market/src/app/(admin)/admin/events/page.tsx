import { Suspense } from "react";
import { createServiceClient } from "@/lib/supabase/server";
import { EventForm } from "./event-form";
import { EventListClient } from "./event-list-client";

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
    .select("*")
    .order("event_date", { ascending: true });

  const upcoming = (events ?? []).filter((e) => e.event_date >= new Date().toISOString().slice(0, 10));
  const past = (events ?? []).filter((e) => e.event_date < new Date().toISOString().slice(0, 10));

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
    </div>
  );
}
