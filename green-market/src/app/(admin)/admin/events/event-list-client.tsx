"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { updateEvent, deleteEvent, toggleEventPublished } from "./actions";

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  event_time: string | null;
  is_published: boolean;
};

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

function EventCard({ event, past = false }: { event: Event; past?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await updateEvent(event.id, fd);
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="bg-surface-container rounded-xl p-5">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-1">Title *</label>
              <input
                name="title"
                required
                defaultValue={event.title}
                className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-1">Location</label>
              <input
                name="location"
                defaultValue={event.location ?? ""}
                className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-1">Date *</label>
              <input
                name="event_date"
                type="date"
                required
                defaultValue={event.event_date}
                style={{ accentColor: "#173809", colorScheme: "light" }}
                className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-1">Time (optional)</label>
              <input
                name="event_time"
                type="time"
                defaultValue={event.event_time ?? ""}
                style={{ accentColor: "#173809", colorScheme: "light" }}
                className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={event.description ?? ""}
              className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving && <Icon name="progress_activity" size="sm" className="animate-spin" />}
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (past) {
    return (
      <div className="bg-surface-container-low rounded-lg px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-tertiary">{event.title}</p>
          <p className="text-xs text-on-surface-variant">{formatDate(event.event_date, event.event_time)}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setEditing(true)} className="p-1.5 text-on-surface-variant hover:text-primary transition-colors" title="Edit">
            <Icon name="edit" size="sm" />
          </button>
          <form action={deleteEvent.bind(null, event.id)}>
            <button type="submit" className="p-1.5 text-on-surface-variant hover:text-error transition-colors">
              <Icon name="delete" size="sm" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface-container-low rounded-xl p-5 flex items-start justify-between gap-4 ${!event.is_published ? "opacity-60" : ""}`}>
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
          {event.location && ` · ${event.location}`}
        </p>
        {event.description && (
          <p className="text-sm text-on-surface-variant mt-2">{event.description}</p>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => setEditing(true)} className="p-2 text-on-surface-variant hover:text-primary transition-colors" title="Edit">
          <Icon name="edit" size="sm" />
        </button>
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
  );
}

export function EventListClient({ upcoming, past }: { upcoming: Event[]; past: Event[] }) {
  return (
    <>
      <section className="mb-10">
        <h2 className="font-label text-xs uppercase tracking-widest text-secondary font-bold mb-4">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-on-surface-variant italic py-6">No upcoming events scheduled.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="font-label text-xs uppercase tracking-widest text-on-surface-variant/50 font-bold mb-4">
            Past Events
          </h2>
          <div className="space-y-2 opacity-50">
            {past.slice(0, 5).map((event) => <EventCard key={event.id} event={event} past />)}
          </div>
        </section>
      )}
    </>
  );
}
