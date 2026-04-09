import { createServiceClient } from "@/lib/supabase/server";
import { createEvent, deleteEvent, toggleEventPublished } from "./actions";
import { Icon } from "@/components/ui/icon";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function AdminEventsPage() {
  const service = createServiceClient();

  const { data: events } = await service
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  const upcoming = (events ?? []).filter((e) => e.event_date >= new Date().toISOString().slice(0, 10));
  const past = (events ?? []).filter((e) => e.event_date < new Date().toISOString().slice(0, 10));

  function formatDate(d: string, t?: string | null) {
    const date = new Date(`${d}T${t ?? "00:00"}:00`).toLocaleDateString("en-US", {
      weekday: "short", month: "long", day: "numeric", year: "numeric",
    });
    if (t) {
      const time = new Date(`${d}T${t}:00`).toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit",
      });
      return `${date} at ${time}`;
    }
    return date;
  }

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
        <form action={createEvent} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Event Title *
              </label>
              <input
                name="title"
                required
                placeholder="e.g. Weekend Farmers Market"
                className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Location
              </label>
              <input
                name="location"
                placeholder="e.g. Downtown Square, Blacksburg VA"
                className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Event Date *
              </label>
              <input
                name="event_date"
                type="date"
                required
                style={{ accentColor: "#173809", colorScheme: "light" }}
                className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Time (optional)
              </label>
              <input
                name="event_time"
                type="time"
                style={{ accentColor: "#173809", colorScheme: "light" }}
                className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Tell customers what to expect..."
              className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all resize-none"
            />
          </div>
          <SubmitButton label="Add Event" loadingLabel="Adding..." />
        </form>
      </section>

      {/* Upcoming events */}
      <section className="mb-10">
        <h2 className="font-label text-xs uppercase tracking-widest text-secondary font-bold mb-4">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-on-surface-variant italic py-6">No upcoming events scheduled.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((event) => (
              <div key={event.id} className={`bg-surface-container-low rounded-xl p-5 flex items-start justify-between gap-4 ${!event.is_published ? "opacity-60" : ""}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-tertiary">{event.title}</h3>
                    {!event.is_published && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mb-1">
                    {formatDate(event.event_date, event.event_time)}
                    {event.location && ` — ${event.location}`}
                  </p>
                  {event.description && (
                    <p className="text-sm text-on-surface-variant mt-2">{event.description}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={toggleEventPublished.bind(null, event.id, !event.is_published)}>
                    <button type="submit" className="p-2 text-on-surface-variant hover:text-primary transition-colors" title={event.is_published ? "Unpublish" : "Publish"}>
                      <Icon name={event.is_published ? "visibility" : "visibility_off"} size="sm" />
                    </button>
                  </form>
                  <form action={deleteEvent.bind(null, event.id)}>
                    <button type="submit" className="p-2 text-on-surface-variant hover:text-error transition-colors" title="Delete">
                      <Icon name="delete" size="sm" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past events */}
      {past.length > 0 && (
        <section>
          <h2 className="font-label text-xs uppercase tracking-widest text-on-surface-variant/50 font-bold mb-4">
            Past Events
          </h2>
          <div className="space-y-2 opacity-50">
            {past.slice(0, 5).map((event) => (
              <div key={event.id} className="bg-surface-container-low rounded-lg px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-tertiary">{event.title}</p>
                  <p className="text-xs text-on-surface-variant">{formatDate(event.event_date, event.event_time)}</p>
                </div>
                <form action={deleteEvent.bind(null, event.id)}>
                  <button type="submit" className="p-1.5 text-on-surface-variant hover:text-error transition-colors">
                    <Icon name="delete" size="sm" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
