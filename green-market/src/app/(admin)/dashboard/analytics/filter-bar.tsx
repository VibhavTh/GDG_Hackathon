"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  vegetables: "Vegetables",
  fruits: "Fruits",
  produce: "Produce",
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

interface Product {
  id: string;
  name: string;
  category: string;
}

interface Props {
  period?: string;
  category?: string;
  month?: string;
  season?: string;
  productId?: string;
  availableCategories: string[];
  availableProducts: Product[];
}

export function AnalyticsFilterBar({
  period, category, month, season, productId, availableCategories, availableProducts,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [productSearch, setProductSearch] = useState("");

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

  const chipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-label font-bold uppercase tracking-wider cursor-pointer transition-all duration-150 ${
      active
        ? "bg-primary text-on-primary"
        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
    }`;

  const activePeriod = month !== undefined ? "month_specific" : season ? "season_" + season : period ?? "week";

  const filteredProducts = productSearch.trim()
    ? availableProducts.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      )
    : availableProducts;

  const selectedProduct = productId ? availableProducts.find((p) => p.id === productId) : null;

  return (
    <div className="mb-10 space-y-5 bg-surface-container-low rounded-xl p-5">
      {/* Period */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-3">Period</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "This Week", key: "period", value: "week", clear: ["month", "season"] },
            { label: "This Month", key: "period", value: "month", clear: ["month", "season"] },
            { label: "This Year", key: "period", value: "year", clear: ["month", "season"] },
          ].map(({ label, key, value, clear }) => (
            <button
              key={value}
              className={chipClass(activePeriod === value)}
              onClick={() => updateParam(key, value, clear)}
            >
              {label}
            </button>
          ))}
          {(["spring", "summer", "fall", "winter"] as const).map((s) => (
            <button
              key={s}
              className={chipClass(activePeriod === "season_" + s)}
              onClick={() => updateParam("season", s, ["period", "month"])}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Month */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-3">Specific Month</p>
        <select
          value={month ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            v === ""
              ? updateParam("month", null, ["month"])
              : updateParam("month", v, ["period", "season"]);
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
            className={chipClass(!category)}
            onClick={() => updateParam("category", null, ["category"])}
          >
            All Types
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              className={chipClass(category === cat)}
              onClick={() => updateParam("category", cat)}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>

      {/* Individual product */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-3">Individual Product</p>
        {selectedProduct ? (
          <div className="flex items-center gap-2">
            <span className="bg-primary text-on-primary text-xs font-label font-bold px-3 py-1.5 rounded-lg">
              {selectedProduct.name}
            </span>
            <button
              onClick={() => updateParam("product_id", null, ["product_id"])}
              className="text-xs text-on-surface-variant hover:text-error transition-colors font-label font-bold uppercase tracking-wider"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="search"
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="bg-surface-container text-on-surface text-xs font-label rounded-lg px-3 py-1.5 border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none w-full max-w-xs placeholder:text-on-surface-variant/50"
            />
            {productSearch.trim() && (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic">No products found.</p>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-label font-bold bg-surface-container text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all duration-150 cursor-pointer"
                      onClick={() => {
                        setProductSearch("");
                        updateParam("product_id", p.id);
                      }}
                    >
                      {p.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
