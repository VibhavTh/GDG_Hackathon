"use client";

import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  produce: "Produce",
  baked_goods: "Baked Goods",
  dairy: "Dairy",
  eggs: "Eggs",
  meat: "Meat",
  honey_beeswax: "Honey & Beeswax",
  flowers: "Flowers",
  plants: "Plants",
  handmade_crafts: "Handmade Crafts",
  value_added: "Jams & Preserves",
  mushrooms: "Mushrooms",
  other: "Other",
};

interface CategoryFilterProps {
  categories: string[];
  active?: string;
  query?: string;
}

export function CategoryFilter({ categories, active, query }: CategoryFilterProps) {
  if (categories.length === 0) return null;

  const q = query ? `&q=${encodeURIComponent(query)}` : "";

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/products${q ? `?${q.slice(1)}` : ""}`}
        className={`px-4 py-1.5 rounded-full text-xs font-label font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.96] ${
          !active || active === "all"
            ? "bg-primary text-on-primary"
            : "bg-surface-container text-on-surface hover:bg-surface-container-high"
        }`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat}
          href={`/products?category=${cat}${q}`}
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
