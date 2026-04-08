import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { Icon } from "@/components/ui/icon";

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

const CATEGORY_ICONS: Record<string, string> = {
  produce: "eco",
  baked_goods: "bakery_dining",
  dairy: "water_drop",
  eggs: "egg",
  meat: "outdoor_grill",
  honey_beeswax: "hive",
  flowers: "local_florist",
  plants: "potted_plant",
  handmade_crafts: "palette",
  value_added: "jam",
  mushrooms: "forest",
  other: "category",
};

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const service = createServiceClient();
  const { data } = await service
    .from("farms")
    .select("name, description")
    .eq("id", id)
    .single();

  if (!data) return { title: "Farm Not Found" };

  return {
    title: `${data.name} — Green Market`,
    description: data.description ?? `Browse fresh products from ${data.name} on Green Market.`,
  };
}

export default async function FarmProfilePage({ params }: Props) {
  const { id } = await params;
  const service = createServiceClient();

  const { data: farm } = await service
    .from("farms")
    .select("id, name, location, description, categories, image_url, created_at")
    .eq("id", id)
    .single();

  if (!farm) notFound();

  const { data: products } = await service
    .from("products")
    .select("id, name, price, image_url, description, category, stock, unit")
    .eq("farm_id", id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .gt("stock", 0)
    .order("created_at", { ascending: false });

  const categories = [...new Set((products ?? []).map((p) => p.category))];
  const totalProducts = products?.length ?? 0;
  const joinedYear = farm.created_at ? new Date(farm.created_at).getFullYear() : null;

  const stats = [
    { value: String(totalProducts), label: "Active Listings" },
    ...(categories.length > 0 ? [{ value: String(categories.length), label: "Categories" }] : []),
    ...(joinedYear ? [{ value: `Since ${joinedYear}`, label: "On Green Market" }] : []),
  ];

  return (
    <div className="pb-24">
      {/* ── Hero banner — clip-path reveal ── */}
      <div className="relative h-64 md:h-96 bg-surface-container-highest overflow-hidden animate-clip-reveal">
        {farm.image_url ? (
          <Image
            src={farm.image_url}
            alt={`${farm.name} banner`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-surface-container to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* ── Farm identity — slides up over banner ── */}
        <div
          className="relative -mt-16 mb-10 flex items-end gap-6 animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          {/* Double-bezel avatar (high-end-visual-design § 4A) */}
          <div className="p-1.5 bg-surface ring-1 ring-outline-variant/20 rounded-[1.375rem] shadow-ambient shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-3xl font-headline shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
              {farm.name[0].toUpperCase()}
            </div>
          </div>
          <div className="pb-2">
            <h1
              className="font-headline italic text-tertiary leading-tight"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
            >
              {farm.name}
            </h1>
            {farm.location && (
              <p className="text-sm text-on-surface-variant font-label flex items-center gap-1 mt-1">
                <Icon name="location_on" size="sm" />
                {farm.location}
              </p>
            )}
          </div>
        </div>

        {/* ── Stats — double-bezel cards, staggered ── */}
        <div
          className="flex flex-wrap gap-4 mb-10 stagger-children"
          style={{ animationDelay: "120ms" }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="p-1 bg-surface-container ring-1 ring-outline-variant/20 rounded-[0.875rem] animate-slide-up-fast"
              style={{ animationDelay: `${120 + i * 60}ms` }}
            >
              <div className="bg-surface-container-low px-6 py-4 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] text-center min-w-[100px]">
                <p className="text-2xl font-headline text-primary leading-none mb-1">{s.value}</p>
                <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Description ── */}
        {farm.description && (
          <div
            className="max-w-2xl mb-10 animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <p className="text-on-surface-variant font-body leading-relaxed text-lg">
              {farm.description}
            </p>
          </div>
        )}

        {/* ── Category pills — hover lift (Emil: hover media query gated) ── */}
        {categories.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mb-14 stagger-children animate-slide-up"
            style={{ animationDelay: "240ms" }}
          >
            {categories.map((cat, i) => (
              <span
                key={cat}
                className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full text-xs font-label font-bold text-on-surface-variant transition-all duration-200 hover-lift animate-slide-up-fast cursor-default"
                style={{ animationDelay: `${240 + i * 40}ms` }}
              >
                <span className="material-symbols-outlined text-sm leading-none">
                  {CATEGORY_ICONS[cat] ?? "category"}
                </span>
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
            ))}
          </div>
        )}

        {/* ── Products grid ── */}
        {products && products.length > 0 ? (
          <>
            <div
              className="flex items-end justify-between mb-8 animate-slide-up"
              style={{ animationDelay: "280ms" }}
            >
              <h2 className="text-2xl font-headline italic text-tertiary">
                Available Now
              </h2>
              <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest">
                {totalProducts} listing{totalProducts !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {products.map((product, i) => {
                const isLowStock = product.stock <= 5;
                return (
                  <div
                    key={product.id}
                    className="harvest-card group bg-surface-container-low p-6 rounded-xl flex flex-col transition-colors duration-200 animate-slide-up-fast"
                    style={{ animationDelay: `${320 + i * 60}ms` }}
                  >
                    <div className="relative -mt-12 mb-6 h-64 overflow-visible rounded-lg">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover rounded-lg transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04] group-hover:-translate-y-1"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-container-high rounded-lg flex items-center justify-center">
                          <Icon name="image" className="text-outline-variant text-5xl" />
                        </div>
                      )}
                      <span className="absolute top-4 right-4 bg-secondary-fixed text-on-secondary-fixed text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </span>
                      {isLowStock && (
                        <span className="absolute top-4 left-4 bg-secondary text-on-secondary text-[10px] uppercase px-2 py-0.5 rounded-full font-bold animate-pulse-soft">
                          Low Stock
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-start mb-1">
                      <Link href={`/products/${product.id}`} className="hover:underline">
                        <h3 className="text-2xl font-headline text-tertiary">
                          {product.name}
                        </h3>
                      </Link>
                      <span className="text-xl font-headline text-primary shrink-0 ml-2">
                        ${(product.price / 100).toFixed(2)}
                      </span>
                    </div>

                    {product.description && (
                      <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-auto">
                      <AddToCartButton
                        farmId={farm.id}
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
          </>
        ) : (
          <div className="py-24 text-center animate-slide-up" style={{ animationDelay: "300ms" }}>
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4 animate-float">
              <Icon name="inventory_2" className="text-on-surface-variant text-3xl" />
            </div>
            <h3 className="font-headline italic text-2xl text-tertiary mb-2">No listings yet</h3>
            <p className="text-on-surface-variant font-body mb-6">
              This farm hasn&rsquo;t added any products yet. Check back soon.
            </p>
            <Link href="/products" className="text-primary font-bold text-sm hover:underline">
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
