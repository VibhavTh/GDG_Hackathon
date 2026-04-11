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
    <section className="w-full py-4 md:py-6">
      <div className="mx-6 md:mx-12 lg:mx-20 relative overflow-hidden bg-surface rounded-2xl px-6 py-8 md:px-10 md:py-10 lg:px-14 lg:py-12">

        {/* Decorative leaf watermark */}
        <svg
          className="absolute -bottom-8 -right-8 w-[280px] h-[280px] opacity-[0.06] pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M100 10 C60 40, 20 80, 30 140 C35 160, 50 175, 80 180 C90 182, 95 178, 100 170 C105 178, 110 182, 120 180 C150 175, 165 160, 170 140 C180 80, 140 40, 100 10Z"
            fill="currentColor"
            className="text-tertiary"
          />
          <path
            d="M100 30 C100 80, 100 130, 100 170"
            stroke="currentColor"
            className="text-tertiary"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M100 70 C80 55, 55 50, 45 60"
            stroke="currentColor"
            className="text-tertiary"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M100 100 C120 85, 145 80, 155 90"
            stroke="currentColor"
            className="text-tertiary"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12">

          {/* Left: label + title + description */}
          <div className="flex-1 min-w-0 max-w-md">
            <p className="font-label text-[9px] font-bold uppercase tracking-[0.25em] text-secondary mb-3">
              Upcoming Event
            </p>
            <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl text-tertiary leading-[1.1] tracking-tight mb-3">
              Next Live{" "}
              <em className="italic">{eventTitle}</em>
            </h2>
            {eventDescription && (
              <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-md">
                {eventDescription}
              </p>
            )}
          </div>

          {/* Right: countdown numbers */}
          {mounted && (
            <div className="flex items-start gap-6 md:gap-8 shrink-0">
              {[
                { value: String(timeLeft.days).padStart(2, "0"), label: "DAYS" },
                { value: String(timeLeft.hours).padStart(2, "0"), label: "HOURS" },
                { value: String(timeLeft.minutes).padStart(2, "0"), label: "MINS" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="font-headline text-4xl md:text-5xl lg:text-6xl text-tertiary leading-none tracking-tight">
                    {value}
                  </span>
                  <span className="mt-2 font-label text-[9px] font-bold uppercase tracking-[0.25em] text-on-surface-variant/50">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
