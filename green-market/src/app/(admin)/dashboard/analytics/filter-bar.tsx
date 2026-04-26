"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  produce: "Fruits & Vegetables",
  baked_goods: "Baked Goods",
  dairy: "Dairy",
  eggs: "Eggs",
  meat: "Meat",
  honey_beeswax: "Honey & Beeswax",
  flowers: "Annual Flowers",
  plants: "Perennial Flowers",
  handmade_crafts: "Handmade Crafts",
  value_added: "Jams & Preserves",
  mushrooms: "Mushrooms",
  other: "Other",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  period?: string;
  category?: string;
  month?: string;
  season?: string;
  availableCategories: string[];
}

export function AnalyticsFilterBar({ period, category, month, season, availableCategories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null, clearKeys: string[] = []) => {
      const params = new URLSearchParams(searchParams.toString());
      clearKeys.forEach((k) => params.delete(k));
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const selectClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-label font-bold uppercase tracking-wider cursor-pointer transition-all duration-150 ${
      active
        ? "bg-primary text-on-primary"
        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
    }`;

  const activePeriod = month !== undefined ? "month_specific" : season ? "season_" + season : period ?? "week";

  return (
    <div className="mb-10 space-y-4 bg-surface-container-low rounded-xl p-5">
      {/* Period */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-3">Period</p>
        <div className="flex flex-wrap gap-2">
          <button
            className={selectClass(activePeriod === "week")}
            onClick={() => updateParam("period", "week", ["month", "season"])}
          >
            This Week
          </button>
          <button
            className={selectClass(activePeriod === "month")}
            onClick={() => updateParam("period", "month", ["month", "season"])}
          >
            This Month
          </button>
          <button
            className={selectClass(activePeriod === "year")}
            onClick={() => updateParam("period", "year", ["month", "season"])}
          >
            This Year
          </button>
          <button
            className={selectClass(activePeriod === "season_spring")}
            onClick={() => updateParam("season", "spring", ["period", "month"])}
          >
            Spring
          </button>
          <button
            className={selectClass(activePeriod === "season_summer")}
            onClick={() => updateParam("season", "summer", ["period", "month"])}
          >
            Summer
          </button>
          <button
            className={selectClass(activePeriod === "season_fall")}
            onClick={() => updateParam("season", "fall", ["period", "month"])}
          >
            Fall
          </button>
          <button
            className={selectClass(activePeriod === "season_winter")}
            onClick={() => updateParam("season", "winter", ["period", "month"])}
          >
            Winter
          </button>
        </div>
      </div>

      {/* Month */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-3">Specific Month</p>
        <select
          value={month ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") {
              updateParam("month", null, ["month"]);
            } else {
              updateParam("month", v, ["period", "season"]);
            }
          }}
          className="bg-surface-container text-on-surface text-xs font-label rounded-lg px-3 py-1.5 border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none cursor-pointer"
        >
          <option value="">Any month</option>
          {MONTH_NAMES.map((name, i) => (
            <option key={i} value={String(i)}>{name}</option>
          ))}
        </select>
      </div>

      {/* Product type */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-3">Product Type</p>
        <div className="flex flex-wrap gap-2">
          <button
            className={selectClass(!category)}
            onClick={() => updateParam("category", null, ["category"])}
          >
            All Types
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              className={selectClass(category === cat)}
              onClick={() => updateParam("category", cat)}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
