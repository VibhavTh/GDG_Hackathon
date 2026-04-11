"use client";

import { useEffect, useState } from "react";

interface Props {
  eventDate: string;
  eventTime: string | null;
  eventTitle: string;
  eventDescription: string | null;
  eventLocation: string | null;
  additionalDates?: { date: string; time: string | null }[];
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

export function EventCountdown({ eventDate, eventTime, eventTitle, eventDescription, eventLocation, additionalDates = [] }: Props) {
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

  const lastDate = additionalDates.length > 0 ? additionalDates[additionalDates.length - 1] : null;

  function fmtDate(d: string) {
    return new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const dateRangeLabel = lastDate
    ? `${fmtDate(eventDate)} - ${fmtDate(lastDate.date)}, ${new Date(`${lastDate.date}T12:00:00`).getFullYear()}`
    : new Date(`${eventDate}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <section style={{ backgroundColor: "#F9EFE4" }} className="w-full py-9 md:py-12">
      <div className="w-full px-10 md:px-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">

          {/* Left: label + title + description */}
          <div className="flex-1 min-w-0">
            <p className="text-secondary font-label text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
              Upcoming Event
            </p>
            <h2 className="font-headline italic text-3xl md:text-4xl text-tertiary leading-tight mb-2">
              {eventTitle}
            </h2>
            <p className="text-on-surface-variant/80 text-xs font-label font-bold mb-2">
              {dateRangeLabel}
            </p>
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
            <div className="flex items-start gap-2.5">
              {[
                { value: String(timeLeft.days).padStart(2, "0"), label: "DAYS" },
                { value: String(timeLeft.hours).padStart(2, "0"), label: "HOURS" },
                { value: String(timeLeft.minutes).padStart(2, "0"), label: "MINUTES" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className="w-[72px] h-[72px] md:w-[90px] md:h-[90px] bg-white rounded-xl flex items-center justify-center">
                    <span className="font-headline italic text-3xl md:text-4xl text-primary leading-none tracking-tight">
                      {value}
                    </span>
                  </div>
                  <span className="text-[9px] font-label font-bold tracking-[0.18em] text-on-surface-variant/60">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Right: Save the Date */}
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-primary text-on-primary font-label font-bold text-sm px-5 py-3 rounded-xl hover:bg-primary/90 active:scale-[0.97] transition-all duration-150"
          >
            <span className="material-symbols-outlined text-[16px] leading-none">calendar_today</span>
            Save the Date
          </a>

        </div>
      </div>
    </section>
  );
}
