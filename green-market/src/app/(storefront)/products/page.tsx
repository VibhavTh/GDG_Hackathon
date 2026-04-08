import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { CategoryFilter } from "./category-filter";

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

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function ProductCatalogPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { category, q } = await searchParams;

  let query = supabase
    .from("products")
    .select("*, farms(id, name, location)")
    .is("deleted_at", null)
    .eq("is_active", true)
    .gt("stock", 0)
    .order("created_at", { ascending: false });

  if (category && category !== "all") query = query.eq("category", category);
  if (q) query = query.ilike("name", `%${q}%`);

  const { data: products } = await query;

  // Get distinct categories that have active products
  const { data: categoryRows } = await supabase
    .from("products")
    .select("category")
    .is("deleted_at", null)
    .eq("is_active", true)
    .gt("stock", 0);

  const categories = [...new Set((categoryRows ?? []).map((r) => r.category))];

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
        {/* Search + category filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 items-start sm:items-center justify-between">
          <CategoryFilter categories={categories} active={category} query={q} />

          <form method="GET">
            {category && (
              <input type="hidden" name="category" value={category} />
            )}
            <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-4 py-2">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">
                search
              </span>
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

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-14">
            {products.map((product) => {
              const farm = product.farms as { id: string; name: string; location: string | null } | null;
              return (
                <div
                  key={product.id}
                  className="harvest-card group bg-surface-container-low p-6 rounded-xl flex flex-col transition-all duration-500"
                >
                  <div className="relative -mt-12 mb-6 h-64 overflow-visible rounded-lg">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2 rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container-high rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline-variant text-5xl">
                          image
                        </span>
                      </div>
                    )}
                    <span className="absolute top-4 right-4 bg-secondary-fixed text-on-secondary-fixed text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </span>
                  </div>

                  <div className="flex justify-between items-start mb-1">
                    <Link href={`/products/${product.id}`} className="hover:underline">
                      <h3 className="text-2xl font-headline text-tertiary">
                        {product.name}
                      </h3>
                    </Link>
                    <span className="text-xl font-headline text-primary">
                      ${(product.price / 100).toFixed(2)}
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
                    <AddToCartButton
                      farmId={(product.farms as { id?: string } | null)?.id ?? ""}
                      item={{
                        productId: product.id,
                        name: product.name,
                        price: product.price / 100,
                        image: product.image_url ?? "",
                        unit: product.unit ?? "each",
                      }}
                    />
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
            <p className="text-on-surface-variant font-body">
              {q
                ? `No products matched "${q}". Try a different search.`
                : "Check back soon — local farmers are adding listings."}
            </p>
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-24 bg-surface-container rounded-2xl p-12 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-headline text-tertiary tracking-tight">
              Join the Harvest Circle
            </h2>
            <p className="text-on-surface-variant">
              Weekly field notes — what&rsquo;s ready now, what&rsquo;s coming,
              and first access to small-batch releases.
            </p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <label htmlFor="newsletter-email-catalog" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email-catalog"
              className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:ring-0 focus:border-primary focus:outline-none px-4 py-3 w-full sm:w-72 text-sm font-body transition-colors"
              placeholder="Your farm-friendly email"
              type="email"
              autoComplete="email"
            />
            <button className="bg-primary text-on-primary px-8 py-3 rounded-md font-medium text-sm transition-all active:scale-95 hover:bg-primary-container whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
