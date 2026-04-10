"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

// Demo events -- replace with DB fetch once a farm_events table exists
const DEMO_EVENTS = [
  { title: "Farmer's Market Delivery", time: "07:00 AM -- 09:30 AM", accent: "border-secondary" },
  { title: "Greenhouse Maintenance", time: "02:00 PM -- 04:00 PM", accent: "border-outline-variant" },
];

export function HarvestCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  // Build grid cells: empty slots + day numbers
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-surface-container-low rounded-xl p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-headline italic text-xl text-tertiary">
          Harvest Schedule
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
          <span
            key={i}
            className="text-[10px] font-label font-semibold text-on-surface-variant/50 text-center py-1"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1 mb-5">
        {cells.map((day, i) => {
          const isToday = isCurrentMonth && day === today.getDate();
          const hasEvent = isCurrentMonth && day === today.getDate(); // demo: events only on today
          return (
            <div key={i} className="flex flex-col items-center">
              <span
                className={`
                  w-7 h-7 flex items-center justify-center text-xs font-medium rounded-full leading-none transition-colors
                  ${day === null ? "" : ""}
                  ${isToday
                    ? "bg-primary text-on-primary font-bold"
                    : day !== null
                    ? "text-on-surface hover:bg-surface-container-high cursor-default"
                    : ""}
                `}
              >
                {day ?? ""}
              </span>
              {hasEvent && (
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Today's Schedule */}
      <div className="mt-auto">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant/50 mb-3">
          Today&apos;s Schedule
        </p>
        <div className="space-y-3 mb-5">
          {DEMO_EVENTS.map((event, i) => (
            <div key={i} className={`border-l-2 ${event.accent} pl-3`}>
              <p className="text-xs font-semibold text-on-surface leading-snug">
                {event.title}
              </p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">
                {event.time}
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/orders"
          className="block w-full text-center text-xs font-label font-bold uppercase tracking-wider text-tertiary border border-outline-variant rounded-lg py-2.5 hover:bg-surface-container-high transition-colors"
        >
          View Full Agenda
        </Link>
      </div>
    </div>
  );
}
