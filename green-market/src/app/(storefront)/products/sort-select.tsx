"use client";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "A to Z" },
] as const;

export function SortSelect({ sort, category, q }: { sort: string; category?: string; q?: string }) {
  function handleChange(value: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (value && value !== "newest") params.set("sort", value);
    const qs = params.toString();
    window.location.href = `/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
        Sort:
      </label>
      <select
        id="sort"
        defaultValue={sort}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-surface-container-low border-none rounded-lg px-3 py-1.5 text-sm font-body text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
