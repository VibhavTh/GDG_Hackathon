"use client";

import { useEffect, useState } from "react";

interface Props {
  eventDate: string;
  eventTime: string | null;
  eventTitle: string;
  eventDescription: string | null;
  eventLocation: string | null;
}

function buildCalendarUrl(title: string, date: string, time: string | null, location: string | null, description: string | null) {
  const start = time
    ? new Date(`${date}T${time}`).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    : date.replace(/-/g, "") + "T000000Z";
  const end = time
    ? new Date(new Date(`${date}T${time}`).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    : date.replace(/-/g, "") + "T020000Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    ...(location ? { location } : {}),
    ...(description ? { details: description } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function EventCountdown({ eventDate, eventTime, eventTitle, eventDescription, eventLocation }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(eventTime ? `${eventDate}T${eventTime}` : `${eventDate}T08:00:00`).getTime();

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft({ days, hours, minutes });
    }

    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  const calendarUrl = buildCalendarUrl(eventTitle, eventDate, eventTime, eventLocation, eventDescription);

  return (
    <div className="bg-[#f5f0e8] rounded-3xl px-8 py-10 md:px-14 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
      {/* Left: title + description */}
      <div className="flex-1">
        <p className="text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-3">
          Upcoming Event
        </p>
        <h2 className="font-headline italic text-3xl md:text-4xl text-tertiary leading-tight mb-3">
          {eventTitle}
        </h2>
        {eventDescription && (
          <p className="text-on-surface-variant font-body text-sm leading-relaxed max-w-sm">
            {eventDescription}
          </p>
        )}
        {eventLocation && (
          <p className="text-on-surface-variant/60 text-xs font-label mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm leading-none">location_on</span>
            {eventLocation}
          </p>
        )}
      </div>

      {/* Center: countdown tiles */}
      {mounted && (
        <div className="flex items-end gap-3">
          {[
            { value: String(timeLeft.days).padStart(2, "0"), label: "Days" },
            { value: String(timeLeft.hours).padStart(2, "0"), label: "Hours" },
            { value: String(timeLeft.minutes).padStart(2, "0"), label: "Minutes" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <span className="font-headline italic text-4xl md:text-5xl text-primary leading-none">
                  {value}
                </span>
              </div>
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant/60">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Right: Calendar tile */}
      <a
        href={calendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 group flex flex-col items-center w-24 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150"
        aria-label="Add to Google Calendar"
      >
        {/* Calendar icon tile */}
        <div className="w-24 h-24 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden border border-white/60">
          {/* Red header strip */}
          <div className="bg-secondary h-6 flex items-center justify-center">
            <span className="text-on-secondary font-label font-bold text-[10px] uppercase tracking-widest">
              {new Date(eventDate + "T12:00:00").toLocaleString("en-US", { month: "short" })}
            </span>
          </div>
          {/* Day number */}
          <div className="flex-1 flex items-center justify-center">
            <span className="font-headline italic text-3xl text-primary leading-none">
              {new Date(eventDate + "T12:00:00").getDate()}
            </span>
          </div>
        </div>
        <span className="mt-2 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant/60 group-hover:text-primary transition-colors duration-150">
          Add to Cal
        </span>
      </a>
    </div>
  );
}
