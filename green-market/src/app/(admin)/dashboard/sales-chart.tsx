"use client";

import { useState } from "react";

export interface ChartBar {
  label: string;
  amount: number;
  isHighlight: boolean;
}

interface Props {
  weeklyBars: ChartBar[];
  dailyBars: ChartBar[];
}

export function SalesChart({ weeklyBars, dailyBars }: Props) {
  const [view, setView] = useState<"weekly" | "daily">("weekly");
  const bars = view === "weekly" ? weeklyBars : dailyBars;
  const maxBarAmount = Math.max(...bars.map((b) => b.amount), 1);

  return (
    <div className="bg-surface-container-low p-8 rounded-xl flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <h4 className="font-headline italic text-xl text-tertiary">
          Sales Performance
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => setView("daily")}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              view === "daily"
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              view === "weekly"
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>
      <div className="flex items-end gap-2 px-2" style={{ height: "180px" }}>
        {bars.map((bar, i) => {
          const barPx = bar.amount > 0
            ? Math.max(6, Math.round((bar.amount / maxBarAmount) * 140))
            : 0;
          return (
            <div key={`${bar.label}-${i}`} className="flex-1 flex flex-col items-center justify-end gap-1" style={{ height: "180px" }}>
              <span className="text-[10px] font-label text-on-surface-variant/60">
                {bar.amount > 0 ? `$${(bar.amount / 100).toFixed(0)}` : ""}
              </span>
              <div
                className={`w-full rounded-t-lg animate-grow-bar ${bar.isHighlight ? "bg-primary" : "bg-primary/20"}`}
                style={{ height: `${barPx}px`, animationDelay: `${i * 60}ms` }}
                title={`${bar.label}: $${(bar.amount / 100).toFixed(2)}`}
              />
              <span className="text-[10px] font-label text-on-surface-variant pb-1">{bar.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
