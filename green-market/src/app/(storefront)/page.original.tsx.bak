import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { createServiceClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const service = createServiceClient();

  // Fetch latest 4 active products with farm info for the bento grid
  const { data: featuredProducts } = await service
    .from("products")
    .select("id, name, price, description, image_url, unit, farm_id, farms(id, name)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .limit(4);

  const featured = featuredProducts ?? [];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[870px] flex items-center px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHfgOxwKYkHJuM69CO1KboNBFHv_XlIy9bFlLeMbvCmUhMHSpOW089IuqcsKzBLEgmoR9NJ9lpX4fG9tcRw8faRdIrIegsfgcQveZvSMR5LusPsWbhq9uVNb817C04rlv9e6UQQK4gHROMEwdp8gpu7hIL6O0JK7aMkxWYaRpz6SGJv3NNmK-59Dis8OuQ0OHrkVgrrpPEoa6REY3f7lv_0bJ0sefcdlhLU_mSN-7xY4K9sPgkuZ9Ph_7u06i2VzLSsmV60NvR_Y6x"
            alt="Misty morning sun rising over a lush rolling green organic farm"
            fill
            sizes="100vw"
            className="object-cover opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="text-secondary font-label text-sm uppercase tracking-[0.2em] mb-4 block animate-slide-up" style={{ animationDelay: "0ms" }}>
            Hand-Sown, Heart-Grown
          </span>
          <h1 className="text-6xl md:text-8xl font-headline italic text-tertiary leading-[1.1] mb-8 animate-slide-up" style={{ animationDelay: "80ms" }}>
            Grown with the <br />
            <span className="text-primary not-italic font-bold">
              Rhythm of Nature.
            </span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl font-body max-w-lg mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "160ms" }}>
            A marketplace for local growers — discover seasonal produce, small-batch goods, and farm-fresh staples from farmers in your community.
          </p>
          <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "240ms" }}>
            <Link href="/products">
              <Button size="lg">Shop Now</Button>
            </Link>
            <Link href="/#about">
              <Button variant="secondary" size="lg">
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="about" className="py-24 bg-surface-container-low content-lazy">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-5 relative">
            {/* Asymmetrical Harvest Card */}
            <div className="relative rounded-xl overflow-visible bg-surface-container-lowest p-4">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdTkBD3e3jg4WHXjb9bdU_sPBNGwO1wDJDAPshqnsxUJu9VkZ_VS5RYAQMijA9NqjbcuAJ3XVYIy85_H1-vzA8LViTOuu9QMNb0CzbmqyBWEcmQ684tQ6ZpCc_wARQ802sUj-s5N6WRed9RmQnYBIqRxsNbHjymV5Eiqy8itpCaGY8XtAcwb1lJdxuDrKWYLfRHySVdEkfCzJeQELAWTXg_YuhLYhify456UG81upBPXdvbZb00zTGgUDyHgC7vQcXiVACJ3IShg5P"
                alt="Rustic wooden table covered in freshly harvested organic vegetables"
                width={600}
                height={400}
                sizes="(max-width: 768px) 100vw, 42vw"
                loading="lazy"
                className="-ml-8 -mt-8 rounded-lg w-full object-cover rotate-[-2deg]"
                style={{ height: "400px" }}
              />
            </div>
          </div>

          <div className="md:col-span-7">
            <h2 className="text-5xl font-headline italic text-tertiary mb-6">
              Rooted in Community
            </h2>
            <div className="space-y-6 text-on-surface-variant text-lg leading-relaxed">
              <p>
                Green Market is a gathering place for local growers and the
                neighbors who love their food. We connect small farms, family
                orchards, and artisan producers with customers who care where
                their food comes from.
              </p>
              <p>
                Every listing on this marketplace represents a real farm with a
                real story&mdash;people tending soil, raising animals, and
                nurturing harvests with patience and pride.
              </p>
            </div>
            <div className="mt-10 flex gap-12">
              <div>
                <span className="block text-3xl font-headline text-secondary italic">
                  20+
                </span>
                <span className="text-xs font-label uppercase tracking-widest opacity-60">
                  Local Farms
                </span>
              </div>
              <div>
                <span className="block text-3xl font-headline text-secondary italic">
                  100+
                </span>
                <span className="text-xs font-label uppercase tracking-widest opacity-60">
                  Seasonal Products
                </span>
              </div>
              <div>
                <span className="block text-3xl font-headline text-secondary italic">
                  100%
                </span>
                <span className="text-xs font-label uppercase tracking-widest opacity-60">
                  Locally Sourced
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Bento Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto content-lazy animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="text-secondary font-label text-xs uppercase tracking-widest mb-2 block">
              Local Harvest
            </span>
            <h2 className="text-5xl font-headline text-tertiary">
              Featured Provisions
            </h2>
          </div>
          <Link
            href="/products"
            className="font-label font-bold text-primary flex items-center gap-2 hover:translate-x-1 transition-transform"
          >
            View Catalog <Icon name="arrow_right_alt" />
          </Link>
        </div>

        {featured.length === 0 ? (
          /* Empty state — no products in DB yet */
          <div className="py-24 text-center bg-surface-container-low rounded-2xl">
            <Icon name="eco" className="text-5xl text-on-surface-variant/40 mb-4" />
            <p className="font-headline italic text-2xl text-tertiary mb-2">
              First harvest coming soon.
            </p>
            <p className="text-on-surface-variant font-body mb-6">
              Local farmers are adding listings — check back shortly.
            </p>
            <Link href="/products" className="text-primary font-bold text-sm hover:underline">
              Browse the catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 stagger-children [&>*]:animate-slide-up-fast">
            {/* Hero card — first product, large */}
            {(() => {
              const p = featured[0];
              const farm = p.farms as unknown as { id: string; name: string } | null;
              return (
                <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-xl bg-surface-container-highest">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-tertiary/80 via-transparent to-transparent p-8 flex flex-col justify-end">
                    {farm && (
                      <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] uppercase font-bold px-3 py-1 rounded-full w-fit mb-3">
                        {farm.name}
                      </span>
                    )}
                    <h3 className="text-3xl font-headline text-on-tertiary italic mb-2">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-on-tertiary-container font-body mb-4 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    <p className="text-on-tertiary font-headline text-xl mb-6">
                      ${(p.price / 100).toFixed(2)}
                      {p.unit && <span className="text-sm font-body opacity-75 ml-1">/ {p.unit}</span>}
                    </p>
                    {farm && (
                      <AddToCartButton
                        farmId={farm.id}
                        item={{
                          productId: p.id,
                          name: p.name,
                          price: p.price / 100,
                          image: p.image_url ?? "",
                          unit: p.unit ?? "each",
                        }}
                        className="w-fit px-6"
                      />
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Cards 2 + 3 */}
            {featured.slice(1, 3).map((p) => {
              const farm = p.farms as unknown as { id: string; name: string } | null;
              return (
                <div key={p.id} className="bg-surface-container-low p-6 rounded-xl group">
                  <div className="overflow-hidden rounded-lg aspect-square mb-6 bg-surface-container-highest relative">
                    {p.image_url ? (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline-variant">
                        <Icon name="image" className="text-4xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/products/${p.id}`} className="hover:underline">
                      <h4 className="font-headline text-xl text-tertiary italic">
                        {p.name}
                      </h4>
                    </Link>
                    <span className="text-primary font-bold shrink-0 ml-2">
                      ${(p.price / 100).toFixed(2)}
                    </span>
                  </div>
                  {p.description && (
                    <p className="text-sm text-on-surface-variant font-body mb-4 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                  {farm && (
                    <AddToCartButton
                      variant="underline"
                      farmId={farm.id}
                      item={{
                        productId: p.id,
                        name: p.name,
                        price: p.price / 100,
                        image: p.image_url ?? "",
                        unit: p.unit ?? "each",
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* Bottom banner — 4th product or CTA */}
            {featured[3] ? (() => {
              const p = featured[3];
              const farm = p.farms as unknown as { id: string; name: string } | null;
              return (
                <div className="md:col-span-2 bg-surface-container p-8 rounded-xl flex flex-col md:flex-row items-center gap-8 group">
                  <div className="flex-1">
                    {farm && (
                      <span className="text-secondary font-label text-[10px] uppercase tracking-widest font-bold block mb-2">
                        {farm.name}
                      </span>
                    )}
                    <Link href={`/products/${p.id}`} className="hover:underline">
                      <h4 className="text-3xl font-headline text-tertiary mb-3 italic">
                        {p.name}
                      </h4>
                    </Link>
                    {p.description && (
                      <p className="text-on-surface-variant mb-4 text-sm line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    <p className="text-primary font-headline text-xl mb-6">
                      ${(p.price / 100).toFixed(2)}
                      {p.unit && <span className="text-sm font-body text-on-surface-variant ml-1">/ {p.unit}</span>}
                    </p>
                    {farm && (
                      <AddToCartButton
                        farmId={farm.id}
                        item={{
                          productId: p.id,
                          name: p.name,
                          price: p.price / 100,
                          image: p.image_url ?? "",
                          unit: p.unit ?? "each",
                        }}
                        className="w-fit"
                      />
                    )}
                  </div>
                  {p.image_url && (
                    <div className="w-full md:w-1/2 aspect-[4/3] rounded-lg overflow-hidden">
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        width={600}
                        height={450}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                </div>
              );
            })() : (
              /* CTA when fewer than 4 products */
              <div className="md:col-span-2 bg-surface-container p-8 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <p className="font-headline italic text-2xl text-tertiary mb-4">
                    More coming soon.
                  </p>
                  <Link
                    href="/products"
                    className="px-6 py-3 bg-primary text-on-primary rounded-md font-bold text-sm transition-transform active:scale-95 inline-block"
                  >
                    Browse All Products
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="mt-20 bg-primary-container py-24 relative overflow-hidden content-lazy">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Icon name="potted_plant" fill className="text-secondary text-5xl mb-6" />
          <h2 className="text-4xl md:text-6xl font-headline text-on-primary-container italic mb-6">
            Join Our Table
          </h2>
          <p className="text-on-primary-container/80 text-lg mb-10 max-w-xl mx-auto">
            Sign up for the Field Notes newsletter to receive seasonal recipes,
            harvest updates from local growers, and first access to small-batch releases.
          </p>
          <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
            <label htmlFor="newsletter-email-home" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email-home"
              className="flex-1 bg-primary-container/60 border-0 border-b-2 border-on-primary-container/30 focus:border-on-primary-container text-on-primary-container placeholder:text-on-primary-container/50 px-4 py-3 rounded-t-md font-body focus:outline-none transition-colors"
              placeholder="Your email address"
              type="email"
              autoComplete="email"
            />
            <button className="bg-secondary text-on-secondary px-8 py-3 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-secondary/90 transition-all active:scale-95 whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>

      </section>
    </>
  );
}
