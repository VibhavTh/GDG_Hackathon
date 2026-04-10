"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { SortSelect } from "./sort-select";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import { LOW_STOCK_THRESHOLD } from "@/config/site";

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

const PRICE_RANGES = [
  { label: "$0 – $10", min: 0, max: 10 },
  { label: "$10 – $50", min: 10, max: 50 },
  { label: "$50 – $100", min: 50, max: 100 },
  { label: "$100 – $500", min: 100, max: 500 },
];

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string | null;
  unit: string | null;
  description: string | null;
  is_organic?: boolean | null;
};

interface Props {
  products: Product[];
  availableCategories: string[];
  category?: string;
  q?: string;
  sort: string;
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-5 border-t border-outline-variant/40 first:border-t-0 first:pt-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-3">
        {title}
      </p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <span
        className={`w-4 h-4 rounded-[var(--radius-sm)] border flex items-center justify-center shrink-0 transition-colors duration-150 ${
          checked
            ? "bg-primary border-primary"
            : "border-outline-variant bg-surface-container-lowest group-hover:border-primary/50"
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={label}
      />
      <span className={`text-sm transition-colors duration-150 ${checked ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>
        {label}
      </span>
    </label>
  );
}

export function CatalogView({ products, availableCategories, category, q, sort }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<Set<number>>(new Set());
  const [organicFilter, setOrganicFilter] = useState<"all" | "organic" | "non-organic">("all");

  const hasUrlFilters = !!q || (!!category && category !== "all");
  const anyClientFilter = selectedCategories.size > 0 || selectedPriceRanges.size > 0 || organicFilter !== "all";

  function toggleCategory(cat: string, checked: boolean) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      checked ? next.add(cat) : next.delete(cat);
      return next;
    });
  }

  function togglePriceRange(idx: number, checked: boolean) {
    setSelectedPriceRanges((prev) => {
      const next = new Set(prev);
      checked ? next.add(idx) : next.delete(idx);
      return next;
    });
  }

  function clearAllFilters() {
    setSelectedCategories(new Set());
    setSelectedPriceRanges(new Set());
    setOrganicFilter("all");
  }

  const filtered = useMemo(() => {
    let list = products;
    if (selectedCategories.size > 0) {
      list = list.filter((p) => selectedCategories.has(p.category));
    }
    if (selectedPriceRanges.size > 0) {
      list = list.filter((p) => {
        const dollars = p.price / 100;
        return [...selectedPriceRanges].some((idx) => {
          const r = PRICE_RANGES[idx];
          return dollars >= r.min && dollars < r.max;
        });
      });
    }
    if (organicFilter !== "all") {
      list = list.filter((p) =>
        organicFilter === "organic" ? p.is_organic === true : !p.is_organic
      );
    }
    return list;
  }, [products, selectedCategories, selectedPriceRanges, organicFilter]);

  const activeFilterCount =
    selectedCategories.size + selectedPriceRanges.size + (organicFilter !== "all" ? 1 : 0);

  const sidebar = (
    <aside className="space-y-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface">
          Filters
        </p>
        {anyClientFilter && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-secondary hover:text-secondary/80 font-medium transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      <SidebarSection title="Categories">
        {availableCategories.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic">No categories yet.</p>
        ) : (
          availableCategories.map((cat) => (
            <FilterCheckbox
              key={cat}
              label={CATEGORY_LABELS[cat] ?? cat}
              checked={selectedCategories.has(cat)}
              onChange={(v) => toggleCategory(cat, v)}
            />
          ))
        )}
      </SidebarSection>

      <SidebarSection title="Price Range">
        {PRICE_RANGES.map((range, idx) => (
          <FilterCheckbox
            key={range.label}
            label={range.label}
            checked={selectedPriceRanges.has(idx)}
            onChange={(v) => togglePriceRange(idx, v)}
          />
        ))}
      </SidebarSection>

      <SidebarSection title="Organic">
        {(["all", "organic", "non-organic"] as const).map((val) => (
          <label key={val} className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setOrganicFilter(val)}>
            <span
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-150 ${
                organicFilter === val
                  ? "border-primary"
                  : "border-outline-variant group-hover:border-primary/50"
              }`}
            >
              {organicFilter === val && (
                <span className="w-2 h-2 rounded-full bg-primary block" />
              )}
            </span>
            <span className={`text-sm transition-colors duration-150 ${organicFilter === val ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>
              {val === "all" ? "All" : val === "organic" ? "Organic" : "Non-Organic"}
            </span>
          </label>
        ))}
      </SidebarSection>
    </aside>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pb-28">
      <div className="flex gap-12 items-start">

        {/* Desktop sidebar */}
        <div className="hidden lg:block w-52 shrink-0 sticky top-28 bg-surface-container-low rounded-[var(--radius-lg)] p-6">
          {sidebar}
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0">

          {/* Top bar */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            {/* Search */}
            <form method="GET" className="flex items-center gap-2 bg-surface-container-low rounded-full px-4 py-2.5 flex-1 min-w-[200px] max-w-sm">
              {category && <input type="hidden" name="category" value={category} />}
              {sort && sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">search</span>
              <input
                name="q"
                defaultValue={q}
                type="search"
                placeholder="Search produce, farms..."
                className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm flex-1 placeholder:text-on-surface-variant/50"
                aria-label="Search products"
              />
            </form>

            {/* Farm context pill */}
            <div className="flex items-center gap-1.5 bg-primary-fixed rounded-full px-3.5 py-2 shrink-0">
              <span className="material-symbols-outlined text-on-primary-fixed-variant text-[16px]">storefront</span>
              <span className="text-xs font-semibold text-on-primary-fixed-variant leading-none">
                Local Farmers&rsquo; Market
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2 shrink-0">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen((o) => !o)}
                className="lg:hidden flex items-center gap-1.5 bg-surface-container-low rounded-full px-4 py-2.5 text-sm font-medium text-on-surface cursor-pointer"
                aria-expanded={sidebarOpen}
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-on-primary text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <SortSelect sort={sort} category={category} q={q} />
            </div>
          </div>

          {/* Mobile sidebar */}
          {sidebarOpen && (
            <div className="lg:hidden mb-8 bg-surface-container-low rounded-[var(--radius-lg)] p-6">
              {sidebar}
            </div>
          )}

          {/* Result count */}
          <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-8">
            {filtered.length} {filtered.length === 1 ? "listing" : "listings"}
            {(hasUrlFilters || anyClientFilter) && " found"}
          </p>

          {/* Product grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
              {filtered.map((product) => {
                const outOfStock = product.stock <= 0;
                const isLowStock = !outOfStock && product.stock <= LOW_STOCK_THRESHOLD;

                return (
                  <div
                    key={product.id}
                    className={`group bg-surface-container-low rounded-[var(--radius-lg)] overflow-hidden flex flex-col animate-slide-up-fast hover-lift ${
                      outOfStock ? "opacity-50" : ""
                    }`}
                  >
                    {/* Image — hero of the card, 70% of card */}
                    <div className="relative h-56 bg-surface-container-high shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-outline-variant text-5xl">eco</span>
                        </div>
                      )}

                      {/* Badges — top-right stack */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                        <span className="bg-surface-container-lowest/90 text-on-surface text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold backdrop-blur-sm">
                          {CATEGORY_LABELS[product.category] ?? product.category}
                        </span>
                        {["produce","baked_goods","dairy","eggs","meat","honey_beeswax","mushrooms","value_added"].includes(product.category) && product.is_organic && (
                          <span className="bg-primary text-on-primary text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold">
                            Organic
                          </span>
                        )}
                      </div>

                      {/* Stock status — top-left, only when relevant */}
                      {outOfStock && (
                        <span className="absolute top-3 left-3 bg-error text-on-error text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold">
                          Out of Stock
                        </span>
                      )}
                      {isLowStock && (
                        <span className="absolute top-3 left-3 bg-secondary text-on-secondary text-[10px] uppercase px-2.5 py-1 rounded-full font-bold animate-pulse-soft">
                          {product.stock} left
                        </span>
                      )}
                    </div>

                    {/* Content — restrained, image is the star */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link href={`/products/${product.id}`} className="flex-1 min-w-0">
                          <h3 className="font-headline text-xl text-tertiary leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-150">
                            {product.name}
                          </h3>
                        </Link>
                        <span className="font-headline text-lg text-primary shrink-0 leading-tight">
                          ${(product.price / 100).toFixed(2)}
                          {product.unit && product.unit !== "each" && (
                            <span className="text-xs font-body text-on-surface-variant font-normal">/{product.unit}</span>
                          )}
                        </span>
                      </div>

                      <div className="mt-auto">
                        {outOfStock ? (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-[var(--radius-md)] bg-surface-container text-on-surface-variant/70 font-bold text-sm cursor-not-allowed"
                          >
                            Out of Stock
                          </button>
                        ) : (
                          <AddToCartButton
                            item={{
                              productId: product.id,
                              name: product.name,
                              price: product.price / 100,
                              image: product.image_url ?? "",
                              unit: product.unit ?? "each",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-28 text-center">
              <p className="font-headline italic text-3xl text-tertiary mb-3">
                Nothing here yet.
              </p>
              <p className="text-on-surface-variant font-body mb-8 max-w-sm mx-auto">
                {q
                  ? `No products matched "${q}".`
                  : anyClientFilter
                  ? "No products match the selected filters."
                  : "Check back soon — local farmers are adding listings."}
              </p>
              <div className="flex items-center justify-center gap-3">
                {hasUrlFilters && (
                  <Link
                    href="/products"
                    className="bg-primary text-on-primary px-6 py-3 rounded-[var(--radius-md)] font-label font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition-colors duration-150 cursor-pointer"
                  >
                    Clear Search
                  </Link>
                )}
                {anyClientFilter && (
                  <button
                    onClick={clearAllFilters}
                    className="bg-surface-container text-on-surface px-6 py-3 rounded-[var(--radius-md)] font-label font-bold text-sm uppercase tracking-widest hover:bg-surface-container-high transition-colors duration-150 cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Newsletter */}
          <div className="mt-28 bg-surface-container rounded-[var(--radius-lg)] p-12 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">Stay close to the land</p>
              <h2 className="text-4xl font-headline text-tertiary leading-tight mb-3">
                Join the Harvest Circle
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Weekly field notes — what&rsquo;s ready now, what&rsquo;s coming,
                and first access to small-batch releases.
              </p>
            </div>
            <NewsletterForm id="newsletter-email-catalog" />
          </div>
        </div>
      </div>
    </div>
  );
}
