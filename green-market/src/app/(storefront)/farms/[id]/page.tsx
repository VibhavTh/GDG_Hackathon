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
    .select("id, name, location, description, categories, banner_url, logo_url, created_at")
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

  // Year joined
  const joinedYear = farm.created_at
    ? new Date(farm.created_at).getFullYear()
    : null;

  return (
    <div className="pb-24">
      {/* Hero banner */}
      <div className="relative h-64 md:h-80 bg-surface-container-highest overflow-hidden">
        {farm.banner_url ? (
          <Image
            src={farm.banner_url}
            alt={`${farm.name} banner`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-surface-container to-secondary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
      </div>

      {/* Farm identity — overlaps banner */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative -mt-16 mb-10 flex items-end gap-6">
          {/* Logo / initial avatar */}
          <div className="w-24 h-24 rounded-2xl bg-primary-container border-4 border-surface flex items-center justify-center text-on-primary-container font-bold text-3xl font-headline shrink-0 overflow-hidden shadow-ambient">
            {farm.logo_url ? (
              <Image
                src={farm.logo_url}
                alt={farm.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              farm.name[0].toUpperCase()
            )}
          </div>
          <div className="pb-2">
            <h1 className="text-3xl md:text-4xl font-headline italic text-tertiary leading-tight">
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

        {/* Stats row */}
        <div className="flex flex-wrap gap-6 mb-8 text-center">
          <div className="bg-surface-container-low px-6 py-4 rounded-xl">
            <p className="text-2xl font-headline text-primary">{totalProducts}</p>
            <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest">
              Active Listings
            </p>
          </div>
          {categories.length > 0 && (
            <div className="bg-surface-container-low px-6 py-4 rounded-xl">
              <p className="text-2xl font-headline text-primary">{categories.length}</p>
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest">
                Categories
              </p>
            </div>
          )}
          {joinedYear && (
            <div className="bg-surface-container-low px-6 py-4 rounded-xl">
              <p className="text-2xl font-headline text-primary">Since {joinedYear}</p>
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest">
                On Green Market
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {farm.description && (
          <div className="max-w-2xl mb-10">
            <p className="text-on-surface-variant font-body leading-relaxed text-lg">
              {farm.description}
            </p>
          </div>
        )}

        {/* Category tags */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((cat) => (
              <span
                key={cat}
                className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full text-xs font-label font-bold text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-sm leading-none">
                  {CATEGORY_ICONS[cat] ?? "category"}
                </span>
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
            ))}
          </div>
        )}

        {/* Products grid */}
        {products && products.length > 0 ? (
          <>
            <h2 className="text-2xl font-headline text-tertiary mb-8">
              Available Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => {
                const isLowStock = product.stock <= 5;
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
                          <Icon name="image" className="text-outline-variant text-5xl" />
                        </div>
                      )}
                      <span className="absolute top-4 right-4 bg-secondary-fixed text-on-secondary-fixed text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </span>
                      {isLowStock && (
                        <span className="absolute top-4 left-4 bg-secondary text-on-secondary text-[10px] uppercase px-2 py-0.5 rounded-full font-bold">
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
                      <span className="text-xl font-headline text-primary">
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
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4">
              <Icon name="inventory_2" className="text-on-surface-variant text-3xl" />
            </div>
            <h3 className="font-headline italic text-2xl text-tertiary mb-2">
              No listings yet
            </h3>
            <p className="text-on-surface-variant font-body mb-6">
              This farm hasn&rsquo;t added any products yet. Check back soon.
            </p>
            <Link
              href="/products"
              className="text-primary font-bold text-sm hover:underline"
            >
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
