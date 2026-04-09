import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { CategoryFilter } from "./category-filter";
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

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "A to Z" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

interface Props {
  searchParams: Promise<{ category?: string; q?: string; sort?: SortOption }>;
}

export default async function ProductCatalogPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { category, q, sort = "newest" } = await searchParams;

  let query = supabase
    .from("products")
    .select("*, farms(id, name, location)")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("stock", { ascending: false });

  if (category && category !== "all") query = query.eq("category", category);
  if (q) query = query.ilike("name", `%${q}%`);

  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: products } = await query;

  // Get distinct categories that have active products
  const { data: categoryRows } = await supabase
    .from("products")
    .select("category")
    .is("deleted_at", null)
    .eq("is_active", true);

  const categories = [...new Set((categoryRows ?? []).map((r) => r.category))];

  const hasFilters = !!q || (!!category && category !== "all");

  return (
    <>
      <header className="pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <span className="text-secondary font-label text-xs uppercase tracking-widest mb-3 block">
            From Local Farms
          </span>
          <h1 className="text-5xl md:text-8xl font-headline text-tertiary mb-6 tracking-tight leading-[1.05]">
            The Season&rsquo;s<br className="hidden md:block" /> Bounty.
          </h1>
          <p className="max-w-xl text-lg text-on-surface-variant font-body leading-relaxed">
            Hand-picked, organically grown, and delivered from local farms to
            your table. Experience the tactile beauty of slow-grown produce.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-24">
        {/* Search + filters row */}
        <div className="flex flex-col gap-4 mb-12">
          {/* Top row: category chips + search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CategoryFilter categories={categories} active={category} query={q} sort={sort} />

            <form method="GET" className="flex items-center gap-2">
              {category && <input type="hidden" name="category" value={category} />}
              {sort && sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
              <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-4 py-2">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
                <input
                  name="q"
                  defaultValue={q}
                  type="search"
                  placeholder="Search products..."
                  className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-48 placeholder:text-on-surface-variant/50"
                  aria-label="Search products"
                />
              </div>
            </form>
          </div>

          {/* Bottom row: sort + result count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant font-body">
              {products?.length ?? 0} listing{(products?.length ?? 0) !== 1 ? "s" : ""}
              {hasFilters && " found"}
            </p>

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
                onChange={(e) => {
                  // client-side submit on change -- handled via onchange below
                  (e.target.form as HTMLFormElement).submit();
                }}
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
          </div>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-14 stagger-children">
            {products.map((product) => {
              const farm = product.farms as { id: string; name: string; location: string | null } | null;
              const outOfStock = product.stock <= 0;
              const isLowStock = !outOfStock && product.stock <= LOW_STOCK_THRESHOLD;
              return (
                <div
                  key={product.id}
                  className={`harvest-card group bg-surface-container-low p-6 rounded-xl flex flex-col transition-colors duration-200 transition-transform animate-slide-up-fast ${outOfStock ? "opacity-60 grayscale" : "hover:-translate-y-0.5"}`}
                >
                  <div className="relative -mt-12 mb-6 h-64 overflow-visible rounded-lg">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:-translate-y-2 rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container-high rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline-variant text-5xl">image</span>
                      </div>
                    )}
                    <span className="absolute top-4 right-4 bg-secondary-fixed text-on-secondary-fixed text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </span>
                    {outOfStock && (
                      <span className="absolute top-4 left-4 bg-error text-on-error text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                        Out of Stock
                      </span>
                    )}
                    {isLowStock && (
                      <span className="absolute top-4 left-4 bg-secondary text-on-secondary text-[10px] uppercase px-2 py-0.5 rounded-full font-bold animate-pulse-soft">
                        Only {product.stock} left
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-start mb-1">
                    <Link href={`/products/${product.id}`} className="hover:underline flex-1 min-w-0 mr-2">
                      <h3 className="text-2xl font-headline text-tertiary truncate">
                        {product.name}
                      </h3>
                    </Link>
                    <span className="text-xl font-headline text-primary shrink-0">
                      ${(product.price / 100).toFixed(2)}
                      {product.unit && product.unit !== "each" && (
                        <span className="text-xs font-body text-on-surface-variant ml-0.5">/{product.unit}</span>
                      )}
                    </span>
                  </div>

                  {farm && (
                    <Link href={`/farms/${farm.id}`} className="text-xs text-secondary font-label font-semibold mb-2 hover:underline block">
                      {farm.name}
                      {farm.location ? ` · ${farm.location}` : ""}
                    </Link>
                  )}

                  {product.description && (
                    <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    {outOfStock ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-lg bg-surface-container-highest text-on-surface-variant font-bold text-sm cursor-not-allowed"
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
                          farmId: farm?.id ?? "",
                          farmName: farm?.name ?? "",
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center">
            <p className="font-headline italic text-3xl text-tertiary mb-3">
              Nothing here yet.
            </p>
            <p className="text-on-surface-variant font-body mb-6">
              {q
                ? `No products matched "${q}". Try a different search.`
                : "Check back soon — local vendors are adding listings."}
            </p>
            {hasFilters && (
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label font-bold text-sm uppercase tracking-widest hover:bg-primary/90 active:scale-[0.97] transition-all duration-150"
              >
                Clear Filters
              </Link>
            )}
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-24 bg-surface-container rounded-2xl p-12 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-headline text-tertiary tracking-tight">
              Stay in the Loop
            </h2>
            <p className="text-on-surface-variant">
              Weekly field notes — what&rsquo;s ready now, what&rsquo;s coming,
              and first access to small-batch releases.
            </p>
          </div>
          <NewsletterForm id="newsletter-email-catalog" />
        </div>
      </main>
    </>
  );
}
