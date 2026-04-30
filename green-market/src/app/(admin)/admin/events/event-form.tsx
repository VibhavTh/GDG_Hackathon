"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { createEvent } from "./actions";

const inputClass =
  "w-full bg-surface px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all";

export function EventForm() {
  const [pending, setPending] = useState(false);
  const [key, setKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await createEvent(fd);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    setKey((k) => k + 1);
    setPending(false);
  }

  return (
    <form key={key} onSubmit={handleSubmit} className="space-y-6">
      {/* What this does callout */}
      <div className="bg-surface-container-low rounded-lg p-5">
        <p className="font-label text-[11px] font-bold uppercase tracking-wider text-secondary mb-3">
          What this does
        </p>
        <ul className="space-y-2.5 text-sm font-body text-on-surface-variant">
          <li className="flex items-start gap-3">
            <Icon name="home" size="sm" className="text-primary mt-0.5 shrink-0" />
            <span>Shows a countdown on the homepage hero</span>
          </li>
          <li className="flex items-start gap-3">
            <Icon name="event" size="sm" className="text-primary mt-0.5 shrink-0" />
            <span>Shows a countdown on the Events page</span>
          </li>
          <li className="flex items-start gap-3">
            <Icon name="photo_library" size="sm" className="text-primary mt-0.5 shrink-0" />
            <span>Creates a photo album in the Gallery for this event</span>
          </li>
        </ul>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
          Event Title *
        </label>
        <input
          name="title"
          required
          placeholder="e.g. Weekend Farmers Market"
          className={inputClass}
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
          Location
        </label>
        <input
          name="location"
          placeholder="e.g. Downtown Square, Blacksburg VA"
          className={inputClass}
        />
      </div>

      {/* When */}
      <div className="bg-surface-container-low rounded-lg p-5 space-y-4">
        <div>
          <p className="text-[11px] font-label font-bold uppercase tracking-wider text-on-surface-variant/80 mb-2">
            Starts <span className="text-on-surface-variant/50 font-normal normal-case">(time optional, defaults to 12:00 AM)</span>
          </p>
          <div className="flex items-center gap-3">
            <input
              name="start_date"
              type="date"
              required
              style={{ accentColor: "#173809", colorScheme: "light" }}
              className={`${inputClass} flex-1`}
            />
            <input
              name="start_time"
              type="time"
              style={{ accentColor: "#173809", colorScheme: "light" }}
              className={`${inputClass} w-36`}
            />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-label font-bold uppercase tracking-wider text-on-surface-variant/80 mb-2">
            Ends <span className="text-on-surface-variant/50 font-normal normal-case">(time optional, defaults to 11:59 PM)</span>
          </p>
          <div className="flex items-center gap-3">
            <input
              name="end_date"
              type="date"
              required
              style={{ accentColor: "#173809", colorScheme: "light" }}
              className={`${inputClass} flex-1`}
            />
            <input
              name="end_time"
              type="time"
              style={{ accentColor: "#173809", colorScheme: "light" }}
              className={`${inputClass} w-36`}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="Tell customers what to expect..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <p className="text-sm font-body text-error bg-error/10 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-3 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all duration-150 flex items-center gap-2"
      >
        {pending && <Icon name="progress_activity" size="sm" className="animate-spin" />}
        {pending ? "Adding..." : "Add Event"}
      </button>
    </form>
  );
}
