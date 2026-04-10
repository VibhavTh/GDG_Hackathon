import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import { QuantityAddToCart } from "./quantity-add-to-cart";
import { Icon } from "@/components/ui/icon";
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

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const service = createServiceClient();
  const { data } = await service
    .from("products")
    .select("name, description")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!data) return { title: "Product Not Found" };

  return {
    title: `${data.name} — Green Market`,
    description: data.description ?? `Buy ${data.name} fresh from a local farm.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const service = createServiceClient();

  const { data: product } = await service
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (!product) notFound();

  const { data: siteSettings } = await service
    .from("site_settings")
    .select("name, location, description")
    .eq("id", 1)
    .single();

  const farm = siteSettings
    ? {
        name: siteSettings.name,
        location: siteSettings.location,
        description: siteSettings.description,
      }
    : null;

  // More products
  const { data: moreProducts } = await service
    .from("products")
    .select("id, name, price, image_url, unit")
    .eq("is_active", true)
    .is("deleted_at", null)
    .gt("stock", 0)
    .neq("id", id)
    .limit(4);

  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  const stockLabel =
    product.stock === 0
      ? "Out of Stock"
      : isLowStock
      ? `Only ${product.stock} left`
      : "In Stock";

  const stockColor =
    product.stock === 0
      ? "text-error"
      : isLowStock
      ? "text-secondary"
      : "text-primary";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant font-label mb-10">
        <Link href="/products" className="hover:text-primary transition-colors">
          All Products
        </Link>
        <Icon name="chevron_right" size="sm" />
        <span className="text-on-surface">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </span>
        <Icon name="chevron_right" size="sm" />
        <span className="text-on-surface font-semibold truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24 animate-slide-up">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container-low">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-outline-variant">
              <Icon name="image" className="text-6xl" />
              <p className="text-sm font-label">No photo yet</p>
            </div>
          )}
          {isLowStock && (
            <div className="absolute top-4 left-4 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse-soft">
              Almost Gone
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {/* Category + farm */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-secondary bg-secondary-fixed px-3 py-1 rounded-full">
              {CATEGORY_LABELS[product.category] ?? product.category}
            </span>
            {farm && (
              <span className="text-xs text-on-surface-variant font-label flex items-center gap-1">
                <Icon name="storefront" size="sm" />
                {farm.name}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-headline italic text-tertiary leading-tight mb-3">
            {product.name}
          </h1>

          {farm?.location && (
            <p className="text-sm text-on-surface-variant font-label flex items-center gap-1 mb-6">
              <Icon name="location_on" size="sm" />
              {farm.location}
            </p>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-headline text-primary">
              ${(product.price / 100).toFixed(2)}
            </span>
            {product.unit && (
              <span className="text-sm text-on-surface-variant font-body">
                per {product.unit}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          <p className={`text-sm font-label font-bold mb-6 flex items-center gap-1.5 ${stockColor}`}>
            <Icon name={product.stock === 0 ? "cancel" : "check_circle"} size="sm" />
            {stockLabel}
          </p>

          {product.description && (
            <p className="text-on-surface-variant font-body leading-relaxed mb-8">
              {product.description}
            </p>
          )}

          {product.stock > 0 ? (
            <QuantityAddToCart
              item={{
                productId: product.id,
                name: product.name,
                price: product.price / 100,
                image: product.image_url ?? "",
                unit: product.unit ?? "each",
              }}
            />
          ) : (
            <button
              disabled
              className="w-full py-3 rounded-md bg-surface-container text-on-surface-variant font-medium text-sm cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}

          {/* Farm card */}
          {farm && (
            <div className="mt-8 p-5 bg-surface-container-low rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0 text-on-primary-container font-bold text-lg">
                {farm.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest mb-0.5">
                  Grown by
                </p>
                <p className="font-headline text-tertiary font-bold truncate">
                  {farm.name}
                </p>
                {farm.description && (
                  <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                    {farm.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* More from this farm */}
      {moreProducts && moreProducts.length > 0 && farm && (
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-secondary font-label text-xs uppercase tracking-widest mb-1 block">
                From {farm.name}
              </span>
              <h2 className="text-3xl font-headline text-tertiary">
                More from this Farm
              </h2>
            </div>
            <Link
              href="/products"
              className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
            >
              View All <Icon name="arrow_forward" size="sm" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger-children">
            {moreProducts.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group bg-surface-container-low rounded-xl overflow-hidden hover:bg-surface-container-high transition-colors"
              >
                <div className="aspect-square relative bg-surface-container-highest">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline-variant">
                      <Icon name="image" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-headline text-tertiary font-semibold line-clamp-1">
                    {p.name}
                  </p>
                  <p className="text-primary font-bold text-sm mt-1">
                    ${(p.price / 100).toFixed(2)}
                    {p.unit && (
                      <span className="text-on-surface-variant font-normal text-xs ml-1">
                        / {p.unit}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
