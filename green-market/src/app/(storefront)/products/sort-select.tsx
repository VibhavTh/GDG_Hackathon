"use client";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "A to Z" },
] as const;

export function SortSelect({ sort, category, q }: { sort: string; category?: string; q?: string }) {
  return (
    <form method="GET" className="flex items-center gap-2">
      {category && <input type="hidden" name="category" value={category} />}
      {q && <input type="hidden" name="q" value={q} />}
      <label htmlFor="sort" className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
        Sort:
      </label>
      <select
        id="sort"
        name="sort"
        defaultValue={sort}
        onChange={(e) => (e.target.form as HTMLFormElement).submit()}
        className="bg-surface-container-low border-none rounded-lg px-3 py-1.5 text-sm font-body text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="text-xs text-primary font-bold">Go</button>
      </noscript>
    </form>
  );
}
