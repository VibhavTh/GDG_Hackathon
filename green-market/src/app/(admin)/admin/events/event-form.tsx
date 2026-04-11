"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { createEvent } from "./actions";

type DateEntry = { date: string; time: string };

export function EventForm() {
  const [dates, setDates] = useState<DateEntry[]>([{ date: "", time: "" }]);
  const [pending, setPending] = useState(false);
  const [key, setKey] = useState(0); // reset form

  function addDate() {
    setDates((d) => [...d, { date: "", time: "" }]);
  }

  function removeDate(i: number) {
    setDates((d) => d.filter((_, idx) => idx !== i));
  }

  function updateDate(i: number, field: "date" | "time", value: string) {
    setDates((d) => d.map((entry, idx) => idx === i ? { ...entry, [field]: value } : entry));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    // Append each date/time pair
    dates.forEach((entry, i) => {
      fd.set(`date_${i}`, entry.date);
      fd.set(`time_${i}`, entry.time);
    });
    fd.set("date_count", String(dates.length));
    await createEvent(fd);
    setDates([{ date: "", time: "" }]);
    setKey((k) => k + 1);
    setPending(false);
  }

  return (
    <form key={key} onSubmit={handleSubmit} className="space-y-5">
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
      </div>

      {/* Dates */}
      <div>
        <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-3">
          Date(s) *
        </label>
        <div className="space-y-2">
          {dates.map((entry, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="date"
                value={entry.date}
                onChange={(e) => updateDate(i, "date", e.target.value)}
                required
                style={{ accentColor: "#173809", colorScheme: "light" }}
                className="flex-1 bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
              />
              <input
                type="time"
                value={entry.time}
                onChange={(e) => updateDate(i, "time", e.target.value)}
                placeholder="Optional"
                style={{ accentColor: "#173809", colorScheme: "light" }}
                className="w-36 bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
              />
              {dates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDate(i)}
                  className="p-2 text-on-surface-variant hover:text-error transition-colors"
                  aria-label="Remove date"
                >
                  <Icon name="close" size="sm" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addDate}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-label font-bold text-primary uppercase tracking-wider hover:opacity-75 transition-opacity"
        >
          <Icon name="add" size="sm" />
          Add another date
        </button>
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

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-3 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all duration-150 flex items-center gap-2"
      >
        {pending && <Icon name="progress_activity" size="sm" className="animate-spin" />}
        {pending ? "Adding..." : `Add Event${dates.length > 1 ? ` (${dates.length} days)` : ""}`}
      </button>
    </form>
  );
}
