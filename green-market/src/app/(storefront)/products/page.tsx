import { createClient } from "@/lib/supabase/server";
import { CatalogView } from "./catalog-view";

type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc";

interface Props {
  searchParams: Promise<{ category?: string; q?: string; sort?: SortOption }>;
}

export default async function ProductCatalogPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { category, q, sort = "newest" } = await searchParams;

  let query = supabase
    .from("products")
    .select("*")
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

  // Get distinct categories that have active products (for sidebar checkboxes)
  const { data: categoryRows } = await supabase
    .from("products")
    .select("category")
    .is("deleted_at", null)
    .eq("is_active", true);

  const availableCategories = [...new Set((categoryRows ?? []).map((r) => r.category))];

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

      <CatalogView
        products={(products ?? []) as Parameters<typeof CatalogView>[0]["products"]}
        availableCategories={availableCategories}
        category={category}
        q={q}
        sort={sort}
      />
    </>
  );
}
