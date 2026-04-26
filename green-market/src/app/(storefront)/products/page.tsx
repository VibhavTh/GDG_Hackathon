import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getProductCategories } from "@/lib/queries/products";
import { CatalogView } from "./catalog-view";
import { generateEmbedding } from "@/lib/embeddings";

type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc";

interface Props {
  searchParams: Promise<{ category?: string; q?: string; sort?: SortOption }>;
}

export default function ProductCatalogPage({ searchParams }: Props) {
  return (
    <Suspense fallback={null}>
      <ProductCatalogContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductCatalogContent({ searchParams }: Props) {
  const supabase = await createClient();
  const { category, q, sort = "newest" } = await searchParams;

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  let products: {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    image_url: string | null;
    unit: string | null;
    description: string | null;
    is_organic: boolean | null;
    available_from: string | null;
    available_until: string | null;
  }[] = [];

  if (q) {
    // Stage 1: substring match on name and description
    const { data: substrResults } = await supabase
      .from("products")
      .select("id, name, price, stock, category, image_url, unit, description, is_organic, available_from, available_until")
      .is("deleted_at", null)
      .eq("is_active", true)
      .or(`available_until.is.null,available_until.gte.${today}`)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .order("stock", { ascending: false });

    if (substrResults && substrResults.length > 0) {
      // Substring hit -- fast path, respect category filter
      products = substrResults.filter(
        (p) => !category || category === "all" || p.category === category
      );
    } else {
      // Stage 2: semantic fallback -- only fires when substring finds nothing
      // Threshold 0.5 avoids loose associations (e.g. "red" -> "orange")
      const queryEmbedding = await generateEmbedding(`farmer's market produce: ${q}`);
      if (queryEmbedding) {
        const { data: semanticResults } = await supabase.rpc("search_products", {
          query_embedding: JSON.stringify(queryEmbedding),
          match_threshold: 0.2,
          match_count: 40,
        });
        products = (semanticResults ?? []).filter(
          (p: { category: string }) => !category || category === "all" || p.category === category
        );
      }
      // If embedding also fails, products stays [] -- correct, show no results
    }
  } else {
    let query = supabase
      .from("products")
      .select("id, name, price, stock, category, image_url, unit, description, is_organic, available_from, available_until")
      .is("deleted_at", null)
      .eq("is_active", true)
      // Hide products that are past their season
      .or(`available_until.is.null,available_until.gte.${today}`);

    if (category && category !== "all") query = query.eq("category", category);

    // Primary sort: user-selected option
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

    // Secondary sort: in-stock items first
    query = query.order("stock", { ascending: false });

    const { data } = await query;
    products = data ?? [];
  }

  const availableCategories = await getProductCategories();

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
            Hand-picked, sustainably grown, and ready for pickup from our local farm
            at the Blacksburg Farmers Market. Experience the beauty of slow-grown produce.
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
