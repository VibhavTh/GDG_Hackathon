import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/icon";
import { StockControl } from "@/components/admin/stock-control";
import { deleteProduct, restoreProduct } from "./actions";

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

export default async function InventoryPage({ searchParams }: Props) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/farmer/login");

  // Use service client for all table queries — RLS policies may not be applied yet
  const service = createServiceClient();

  const { data: farm } = await service
    .from("farms")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!farm) redirect("/farmer/setup");

  const { category, q } = await searchParams;

  // Active products
  let query = service
    .from("products")
    .select("*")
    .eq("farm_id", farm.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (category && category !== "all") query = query.eq("category", category);
  if (q) query = query.ilike("name", `%${q}%`);

  const { data: products } = await query;

  // Soft-deleted products
  const { data: removedProducts } = await service
    .from("products")
    .select("*")
    .eq("farm_id", farm.id)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false })
    .limit(10);

  // Unique categories for filter chips
  const { data: allProducts } = await service
    .from("products")
    .select("category")
    .eq("farm_id", farm.id)
    .is("deleted_at", null);

  const usedCategories = [
    ...new Set((allProducts ?? []).map((p) => p.category)),
  ];

  const lowStockCount = (products ?? []).filter((p) => p.stock <= 5).length;

  return (
    <>
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <h2 className="text-2xl font-headline font-semibold tracking-tight italic text-tertiary">
            Inventory
          </h2>
          <div className="flex items-center gap-4">
            <Link
              href="/inventory/new"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium active:scale-95 transition-all hover:bg-primary-container flex items-center gap-2"
            >
              <Icon name="add" size="sm" />
              Add Product
            </Link>
            <form method="GET" className="hidden md:flex items-center gap-2">
              <Icon name="search" className="text-on-surface-variant" aria-hidden="true" />
              <input
                name="q"
                defaultValue={q}
                className="bg-surface-container-highest/50 border-none focus:ring-0 focus:outline-none focus:bg-surface-container-highest text-sm rounded-md w-48 placeholder:text-on-surface-variant/50 transition-colors px-3 py-2"
                placeholder="Search inventory..."
                type="search"
                aria-label="Search inventory"
              />
            </form>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary + Filters */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h3 className="text-3xl font-headline text-tertiary">
              Current Stock
            </h3>
            <p className="text-on-surface-variant text-sm mt-1 font-medium">
              {products?.length ?? 0} active listing
              {products?.length !== 1 ? "s" : ""}
              {lowStockCount > 0 && (
                <span className="ml-2 text-error font-semibold">
                  · {lowStockCount} low stock
                </span>
              )}
            </p>
          </div>

          {/* Category filter chips */}
          {usedCategories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/inventory"
                className={`px-4 py-1.5 rounded-full text-xs font-label font-bold uppercase tracking-wider transition-colors ${
                  !category || category === "all"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                }`}
              >
                All
              </Link>
              {usedCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/inventory?category=${cat}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-label font-bold uppercase tracking-wider transition-colors ${
                    category === cat
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const isLowStock = product.stock <= 5;
              return (
                <div
                  key={product.id}
                  className={`bg-surface-container-low rounded-xl p-6 transition-all hover:bg-surface-container-high group relative ${
                    isLowStock ? "opacity-70" : ""
                  }`}
                >
                  {isLowStock && (
                    <div className="absolute inset-0 flex items-start justify-end pointer-events-none z-10 p-4">
                      <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest">
                        Low Stock
                      </span>
                    </div>
                  )}

                  {/* Edit / Delete */}
                  <div className="absolute top-4 right-4 flex gap-1">
                    <Link
                      href={`/inventory/${product.id}/edit`}
                      className="p-2 text-on-surface-variant hover:text-secondary transition-colors focus-visible:outline-2 focus-visible:outline-primary rounded"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Icon name="edit" />
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteProduct(product.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="p-2 text-on-surface-variant hover:text-error transition-colors focus-visible:outline-2 focus-visible:outline-error rounded"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Icon name="delete" />
                      </button>
                    </form>
                  </div>

                  {/* Product info */}
                  <div className="flex gap-4 mb-6">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-variant">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={80}
                          height={80}
                          sizes="80px"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="image" className="text-outline-variant" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center pr-12">
                      <span className="text-[10px] uppercase tracking-tighter text-secondary font-bold mb-1">
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </span>
                      <h4 className="text-lg font-headline font-bold text-tertiary leading-tight">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price + Stock */}
                  <div className="flex justify-between items-center bg-surface-container-lowest p-4 rounded-lg">
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold">
                        Price
                      </p>
                      <p className="text-lg font-headline text-primary">
                        ${(product.price / 100).toFixed(2)}
                        {product.unit && product.unit !== "each" && (
                          <span className="text-xs text-on-surface-variant font-label ml-1">/ {product.unit}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold">
                        Stock
                      </p>
                      <StockControl
                        productId={product.id}
                        productName={product.name}
                        initialStock={product.stock}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add New Card */}
            <Link
              href="/inventory/new"
              className="bg-surface-container rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-8 text-center hover:border-primary transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
                <Icon name="add" className="text-primary" />
              </div>
              <p className="font-headline text-lg font-bold text-tertiary">
                Add New Item
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                Expand your seasonal offerings
              </p>
            </Link>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
              <Icon name="inventory_2" className="text-on-surface-variant text-4xl" />
            </div>
            <h3 className="font-headline italic text-2xl text-tertiary mb-2">
              No products yet
            </h3>
            <p className="text-on-surface-variant font-body mb-8">
              Add your first product to start selling on the marketplace.
            </p>
            <Link
              href="/inventory/new"
              className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label font-bold uppercase tracking-widest text-sm hover:bg-primary/90 active:scale-95 transition-all"
            >
              Add First Product
            </Link>
          </div>
        )}

        {/* Recently Removed */}
        {removedProducts && removedProducts.length > 0 && (
          <div className="mt-16 bg-surface-container-low rounded-2xl overflow-hidden">
            <div className="p-6 flex justify-between items-center">
              <h4 className="font-headline text-xl text-tertiary">
                Recently Removed
              </h4>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Soft deleted — still visible on old orders
              </p>
            </div>

            <div className="space-y-0">
              {removedProducts.map((item, i) => (
                <div
                  key={item.id}
                  className={`p-4 flex items-center justify-between hover:bg-surface-container-highest/30 transition-colors ${
                    i % 2 === 1 ? "bg-surface-container/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-md bg-surface-variant grayscale opacity-50 overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={40}
                          height={40}
                          sizes="40px"
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="image" className="text-outline-variant text-sm" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-tertiary">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        Removed{" "}
                        {new Date(item.deleted_at!).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </p>
                    </div>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await restoreProduct(item.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-full bg-surface-container-highest text-[10px] font-bold uppercase tracking-widest hover:bg-surface-variant text-on-surface transition-all"
                    >
                      Restore
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
