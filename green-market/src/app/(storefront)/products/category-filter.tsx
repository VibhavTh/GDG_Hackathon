"use client";

import Link from "next/link";

const ALLOWED_CATEGORIES = ["flowers", "plants", "fruits", "vegetables"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  flowers: "Annual Flowers",
  plants: "Perennial Flowers",
  fruits: "Fruits",
  vegetables: "Vegetables",
};

interface CategoryFilterProps {
  categories: string[];
  active?: string;
  query?: string;
  sort?: string;
}

function buildHref(params: { category?: string; q?: string; sort?: string }) {
  const sp = new URLSearchParams();
  if (params.category && params.category !== "all") sp.set("category", params.category);
  if (params.q) sp.set("q", params.q);
  if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
  const qs = sp.toString();
  return `/products${qs ? `?${qs}` : ""}`;
}

export function CategoryFilter({ categories, active, query, sort }: CategoryFilterProps) {
  const visible = ALLOWED_CATEGORIES.filter((c) => categories.includes(c));
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={buildHref({ q: query, sort })}
        className={`px-4 py-1.5 rounded-full text-xs font-label font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.96] ${
          !active || active === "all"
            ? "bg-primary text-on-primary"
            : "bg-surface-container text-on-surface hover:bg-surface-container-high"
        }`}
      >
        All
      </Link>
      {visible.map((cat) => (
        <Link
          key={cat}
          href={buildHref({ category: cat, q: query, sort })}
          className={`px-4 py-1.5 rounded-full text-xs font-label font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.96] ${
            active === cat
              ? "bg-primary text-on-primary"
              : "bg-surface-container text-on-surface hover:bg-surface-container-high"
          }`}
        >
          {CATEGORY_LABELS[cat] ?? cat}
        </Link>
      ))}
    </div>
  );
}
