"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
}

interface SeasonalProduct {
  name: string;
  available_from: string; // YYYY-MM-DD
  available_until?: string; // YYYY-MM-DD
}

interface HarvestCalendarProps {
  events?: CalendarEvent[];
  seasonalProducts?: SeasonalProduct[];
}

export function HarvestCalendar({ events = [], seasonalProducts = [] }: HarvestCalendarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // Build a set of day numbers that have events this month
  const eventDays = new Set<number>();
  for (const e of events) {
    const d = new Date(e.date + "T12:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) {
      eventDays.add(d.getDate());
    }
  }

  // Build a set of day numbers where a product becomes available this month
  const seasonDays = new Set<number>();
  for (const p of seasonalProducts) {
    const d = new Date(p.available_from + "T12:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) {
      seasonDays.add(d.getDate());
    }
  }

  // Events and seasonal products happening today or in the future (for the agenda below)
  const todayStr = today.toISOString().split("T")[0];
  const todayEvents = events.filter((e) => e.date === todayStr);

  // Products coming into season this month
  const comingThisMonth = seasonalProducts.filter((p) => {
    const d = new Date(p.available_from + "T12:00:00");
    return d.getFullYear() === year && d.getMonth() === month;
  });

  return (
    <div className="bg-surface-container-low rounded-xl p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-headline italic text-xl text-tertiary">
          Schedule
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-tertiary"
            aria-label="Previous month"
          >
            <Icon name="chevron_left" size="sm" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-tertiary"
            aria-label="Next month"
          >
            <Icon name="chevron_right" size="sm" />
          </button>
        </div>
      </div>

      {/* Month/Year */}
      <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant text-center mb-4">
        {MONTH_NAMES[month]} {year}
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d, i) => (
          <span key={i} className="text-[10px] font-label font-semibold text-on-surface-variant/50 text-center py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1 mb-5">
        {cells.map((day, i) => {
          const isToday = isCurrentMonth && day === today.getDate();
          const hasEvent = day !== null && eventDays.has(day);
          const hasSeason = day !== null && seasonDays.has(day);
          return (
            <div key={i} className="flex flex-col items-center">
              <span
                className={`
                  w-7 h-7 flex items-center justify-center text-xs font-medium rounded-full leading-none transition-colors
                  ${isToday ? "bg-primary text-on-primary font-bold" : day !== null ? "text-on-surface hover:bg-surface-container-high cursor-default" : ""}
                `}
              >
                {day ?? ""}
              </span>
              {/* Indicator dots */}
              {(hasEvent || hasSeason) && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasEvent && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                  {hasSeason && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dot legend */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
          <span className="text-[10px] text-on-surface-variant">Events</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          <span className="text-[10px] text-on-surface-variant">In season</span>
        </div>
      </div>

      {/* Today's agenda */}
      <div className="mt-auto">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant/50 mb-3">
          {todayEvents.length > 0 ? "Today" : comingThisMonth.length > 0 ? "Coming this month" : "No events today"}
        </p>

        {todayEvents.length > 0 && (
          <div className="space-y-3 mb-4">
            {todayEvents.map((e) => (
              <div key={e.id} className="border-l-2 border-secondary pl-3">
                <p className="text-xs font-semibold text-on-surface leading-snug">{e.title}</p>
                {e.time && <p className="text-[10px] text-on-surface-variant mt-0.5">{e.time}</p>}
              </div>
            ))}
          </div>
        )}

        {todayEvents.length === 0 && comingThisMonth.length > 0 && (
          <div className="space-y-2 mb-4">
            {comingThisMonth.slice(0, 3).map((p) => (
              <div key={p.name} className="border-l-2 border-primary pl-3">
                <p className="text-xs font-semibold text-on-surface leading-snug">{p.name}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  Available {new Date(p.available_from + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/admin/events"
          className="block w-full text-center text-xs font-label font-bold uppercase tracking-wider text-tertiary border border-outline-variant rounded-lg py-2.5 hover:bg-surface-container-high transition-colors"
        >
          Manage Events
        </Link>
      </div>
    </div>
  );
}
