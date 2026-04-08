import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { createServiceClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const service = createServiceClient();

  const { data: featuredProducts } = await service
    .from("products")
    .select("id, name, price, description, image_url, unit, farm_id, farms(id, name, location)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .limit(4);

  const { count: farmCountNum } = await service
    .from("farms")
    .select("id", { count: "exact", head: true });

  const { count: productCountNum } = await service
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .is("deleted_at", null);

  const featured = featuredProducts ?? [];

  return (
    <>
      {/* ── HERO — Full-bleed dark primary, oversized editorial type ── */}
      <section className="min-h-[100dvh] bg-primary relative overflow-hidden flex flex-col">
        {/* Background farm image, blended */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHfgOxwKYkHJuM69CO1KboNBFHv_XlIy9bFlLeMbvCmUhMHSpOW089IuqcsKzBLEgmoR9NJ9lpX4fG9tcRw8faRdIrIegsfgcQveZvSMR5LusPsWbhq9uVNb817C04rlv9e6UQQK4gHROMEwdp8gpu7hIL6O0JK7aMkxWYaRpz6SGJv3NNmK-59Dis8OuQ0OHrkVgrrpPEoa6REY3f7lv_0bJ0sefcdlhLU_mSN-7xY4K9sPgkuZ9Ph_7u06i2VzLSsmV60NvR_Y6x"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20 mix-blend-luminosity"
            aria-hidden="true"
          />
          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-transparent to-primary" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between flex-1 px-6 md:px-14 pt-32 pb-12">
          {/* Top eyebrow */}
          <div className="flex items-center justify-between">
            <span className="text-on-primary/50 font-label text-[11px] uppercase tracking-[0.3em] animate-slide-up">
              Est. 2024 &mdash; Local First
            </span>
            <span className="text-on-primary/50 font-label text-[11px] uppercase tracking-[0.3em] animate-slide-up" style={{ animationDelay: "60ms" }}>
              Farm &rarr; Table
            </span>
          </div>

          {/* Oversized headline */}
          <div className="py-8 md:py-0">
            <h1
              className="font-headline italic text-on-primary leading-[0.92] tracking-tighter animate-slide-up"
              style={{
                fontSize: "clamp(3.5rem, 12vw, 11rem)",
                animationDelay: "80ms",
              }}
            >
              <span className="block">Grown</span>
              <span className="block text-secondary">fresh.</span>
              <span className="block">Sold</span>
              <span className="block text-primary-fixed">direct.</span>
            </h1>
          </div>

          {/* Bottom row — description + CTA */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-end animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="max-w-[44ch]">
              <p className="text-on-primary/70 font-body text-lg leading-relaxed mb-6">
                A marketplace for local growers. Seasonal produce, small-batch goods, and farm-fresh staples — from real farmers in your community.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-on-primary text-primary px-8 py-4 rounded-xl font-label font-bold text-sm uppercase tracking-widest hover:bg-primary-fixed active:scale-[0.97] transition-all duration-150"
                >
                  Browse the Harvest
                  <Icon name="arrow_forward" size="sm" />
                </Link>
                <Link
                  href="#about"
                  className="inline-flex items-center gap-2 border border-on-primary/20 text-on-primary/70 hover:text-on-primary hover:border-on-primary/50 px-8 py-4 rounded-xl font-label font-bold text-sm uppercase tracking-widest transition-all duration-150 active:scale-[0.97]"
                >
                  Our Story
                </Link>
              </div>
            </div>

            {/* Stats — bottom right */}
            <div className="flex gap-10 md:gap-14 text-right">
              {[
                { value: `${farmCountNum ?? 20}+`, label: "Local Farms" },
                { value: `${productCountNum ?? 100}+`, label: "Listings" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-headline italic text-on-primary text-4xl md:text-5xl leading-none">{s.value}</p>
                  <p className="text-on-primary/50 font-label text-[11px] uppercase tracking-widest mt-2">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div className="bg-secondary overflow-hidden py-4 select-none">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 22s linear infinite" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-6 px-6 font-headline italic text-on-secondary text-xl">
              {["Organic Produce", "Heritage Eggs", "Raw Honey", "Artisan Bread", "Farm Dairy", "Wildflowers", "Seasonal Greens", "Handmade Preserves"].map((item) => (
                <span key={item} className="inline-flex items-center gap-6">
                  {item}
                  <span className="text-on-secondary/40 text-sm">&#10022;</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-24 px-6 md:px-14 max-w-[1400px] mx-auto content-lazy">
        <div className="flex items-end justify-between mb-14">
          <div>
            <span className="text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-3 block">
              In Season Now
            </span>
            <h2 className="font-headline italic text-tertiary" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 1.05 }}>
              What&rsquo;s ready now
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:inline-flex items-center gap-2 font-label font-bold text-sm text-primary uppercase tracking-wider border-b border-primary pb-0.5 hover:gap-4 transition-all duration-150"
          >
            All Products <Icon name="arrow_forward" size="sm" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="py-24 text-center bg-surface-container-low rounded-3xl">
            <Icon name="eco" className="text-5xl text-on-surface-variant/40 mb-4" />
            <p className="font-headline italic text-2xl text-tertiary mb-2">First harvest coming soon.</p>
            <p className="text-on-surface-variant font-body mb-6">Local farmers are adding listings — check back shortly.</p>
            <Link href="/products" className="text-primary font-bold text-sm hover:underline">Browse the catalog</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 stagger-children">
            {/* Hero card — 7 cols, tall */}
            {featured[0] && (() => {
              const p = featured[0];
              const farm = p.farms as unknown as { id: string; name: string; location?: string | null } | null;
              return (
                <div className="md:col-span-7 group relative overflow-hidden rounded-3xl bg-tertiary min-h-[520px] animate-slide-up-fast">
                  {p.image_url && (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 58vw"
                      className="object-cover opacity-60 mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-tertiary via-tertiary/40 to-transparent" />
                  <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      {farm && (
                        <Link href={`/farms/${farm.id}`} className="inline-flex items-center gap-2 bg-on-tertiary/10 backdrop-blur-sm border border-on-tertiary/20 text-on-tertiary/80 hover:text-on-tertiary px-4 py-2 rounded-full text-[11px] font-label font-bold uppercase tracking-widest transition-colors duration-150">
                          <Icon name="storefront" size="sm" />
                          {farm.name}
                        </Link>
                      )}
                      <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-[11px] font-label font-bold uppercase tracking-widest">
                        Featured
                      </span>
                    </div>
                    <div>
                      <Link href={`/products/${p.id}`}>
                        <h3 className="font-headline italic text-on-tertiary leading-tight mb-3 hover:text-on-tertiary/80 transition-colors duration-150" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}>
                          {p.name}
                        </h3>
                      </Link>
                      {p.description && (
                        <p className="text-on-tertiary/60 font-body text-sm line-clamp-2 mb-6 max-w-[44ch]">{p.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="font-headline italic text-on-tertiary text-3xl">
                          ${(p.price / 100).toFixed(2)}
                          {p.unit && <span className="text-base font-body opacity-50 ml-2">/ {p.unit}</span>}
                        </p>
                        {farm && (
                          <AddToCartButton
                            farmId={farm.id}
                            item={{ productId: p.id, name: p.name, price: p.price / 100, image: p.image_url ?? "", unit: p.unit ?? "each" }}
                            className="w-auto px-6"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Right column — 5 cols */}
            <div className="md:col-span-5 flex flex-col gap-5">
              {featured.slice(1, 3).map((p, i) => {
                const farm = p.farms as unknown as { id: string; name: string } | null;
                return (
                  <div
                    key={p.id}
                    className="group bg-surface-container-low hover:bg-surface-container rounded-3xl p-6 flex gap-5 items-center flex-1 transition-colors duration-150 animate-slide-up-fast"
                    style={{ animationDelay: `${(i + 1) * 80}ms` }}
                  >
                    <div className="w-28 h-28 rounded-2xl overflow-hidden bg-surface-container-highest shrink-0 relative">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          sizes="112px"
                          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline-variant">
                          <Icon name="image" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {farm && (
                        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-secondary mb-1">{farm.name}</p>
                      )}
                      <Link href={`/products/${p.id}`} className="hover:underline">
                        <h4 className="font-headline italic text-2xl text-tertiary leading-tight mb-2">{p.name}</h4>
                      </Link>
                      <div className="flex items-center justify-between">
                        <span className="font-headline text-xl text-primary">
                          ${(p.price / 100).toFixed(2)}
                          {p.unit && <span className="text-xs font-body text-on-surface-variant ml-1">/ {p.unit}</span>}
                        </span>
                        {farm && (
                          <AddToCartButton
                            variant="underline"
                            farmId={farm.id}
                            item={{ productId: p.id, name: p.name, price: p.price / 100, image: p.image_url ?? "", unit: p.unit ?? "each" }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 4th product */}
              {featured[3] ? (() => {
                const p = featured[3];
                const farm = p.farms as unknown as { id: string; name: string } | null;
                return (
                  <div
                    className="group relative overflow-hidden rounded-3xl bg-primary-container flex-1 min-h-[160px] animate-slide-up-fast"
                    style={{ animationDelay: "240ms" }}
                  >
                    {p.image_url && (
                      <>
                        <Image src={p.image_url} alt={p.name} fill sizes="40vw" className="object-cover opacity-30 mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.05]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
                      </>
                    )}
                    <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                      <div>
                        {farm && <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-primary/60 mb-1">{farm.name}</p>}
                        <Link href={`/products/${p.id}`}>
                          <h4 className="font-headline italic text-2xl text-on-primary hover:text-on-primary/80 transition-colors duration-150">{p.name}</h4>
                        </Link>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <p className="font-headline text-xl text-on-primary">${(p.price / 100).toFixed(2)}</p>
                        {farm && (
                          <AddToCartButton
                            farmId={farm.id}
                            item={{ productId: p.id, name: p.name, price: p.price / 100, image: p.image_url ?? "", unit: p.unit ?? "each" }}
                            className="w-auto px-5 shrink-0"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="bg-surface-container-low rounded-3xl p-6 flex-1 flex flex-col items-center justify-center text-center animate-slide-up-fast" style={{ animationDelay: "240ms" }}>
                  <p className="font-headline italic text-xl text-tertiary mb-4">More coming soon.</p>
                  <Link href="/products" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label font-bold text-xs uppercase tracking-widest hover:bg-primary/90 active:scale-[0.97] transition-all duration-150">
                    Browse All
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 md:hidden text-center">
          <Link href="/products" className="inline-flex items-center gap-2 font-label font-bold text-sm text-primary uppercase tracking-wider border-b border-primary pb-0.5">
            All Products <Icon name="arrow_forward" size="sm" />
          </Link>
        </div>
      </section>

      {/* ── ABOUT — Dark left panel, image right ── */}
      <section id="about" className="py-0 content-lazy">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[580px]">
          {/* Dark editorial left */}
          <div className="bg-tertiary px-8 md:px-16 py-16 md:py-24 flex flex-col justify-between">
            <span className="inline-flex items-center gap-3 text-on-tertiary/40 font-label text-[11px] uppercase tracking-[0.3em]">
              <span className="w-8 h-px bg-on-tertiary/30 inline-block" />
              About Green Market
            </span>
            <div>
              <h2
                className="font-headline italic text-on-tertiary leading-[0.95] tracking-tight mb-8"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                Rooted in<br />community.
              </h2>
              <p className="text-on-tertiary/60 font-body leading-relaxed max-w-[44ch] mb-8">
                We connect small farms, family orchards, and artisan producers with customers who care where their food comes from. Every listing is a real farm with a real story.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-3 text-on-tertiary font-label font-bold text-sm uppercase tracking-widest border-b border-on-tertiary/30 pb-1 hover:border-on-tertiary transition-colors duration-150"
              >
                Explore farms <Icon name="arrow_forward" size="sm" />
              </Link>
            </div>
            {/* Stat row */}
            <div className="flex gap-10 pt-10 border-t border-on-tertiary/10">
              {[
                { value: "100%", label: "Locally sourced" },
                { value: "No", label: "Middlemen" },
                { value: "Direct", label: "From farmer" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-headline italic text-secondary text-2xl">{s.value}</p>
                  <p className="text-on-tertiary/40 font-label text-[10px] uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Full-bleed image right */}
          <div className="relative min-h-[400px]">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdTkBD3e3jg4WHXjb9bdU_sPBNGwO1wDJDAPshqnsxUJu9VkZ_VS5RYAQMijA9NqjbcuAJ3XVYIy85_H1-vzA8LViTOuu9QMNb0CzbmqyBWEcmQ684tQ6ZpCc_wARQ802sUj-s5N6WRed9RmQnYBIqRxsNbHjymV5Eiqy8itpCaGY8XtAcwb1lJdxuDrKWYLfRHySVdEkfCzJeQELAWTXg_YuhLYhify456UG81upBPXdvbZb00zTGgUDyHgC7vQcXiVACJ3IShg5P"
              alt="Fresh vegetables on a rustic wooden table"
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — Bold numbered steps ── */}
      <section className="py-24 px-6 md:px-14 max-w-[1400px] mx-auto content-lazy">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-16 items-start">
          {/* Sticky label */}
          <div className="md:sticky md:top-32 md:w-48">
            <span className="text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-3 block">
              Simple by design
            </span>
            <h2 className="font-headline italic text-tertiary text-3xl leading-tight">
              How it<br />works
            </h2>
          </div>

          {/* Steps */}
          <div className="space-y-0 divide-y divide-outline-variant/30">
            {[
              {
                n: "01",
                title: "Browse the harvest",
                body: "Explore what's in season from farms near you. Filter by category, search for something specific, or let the weekly picks guide you.",
                href: "/products",
                cta: "Shop now",
              },
              {
                n: "02",
                title: "Add to your basket",
                body: "Your cart holds items from one farm at a time — keeping your order fresh, traceable, and personal.",
                href: null,
                cta: null,
              },
              {
                n: "03",
                title: "Pick up or get delivery",
                body: "Choose farm pickup or home delivery. Pay securely through Stripe, then track your order from preparation to your door.",
                href: null,
                cta: null,
              },
            ].map((step) => (
              <div key={step.n} className="py-10 grid grid-cols-[auto_1fr] gap-10 items-start group">
                <span className="font-headline italic text-5xl text-outline-variant/50 leading-none pt-1 group-hover:text-secondary transition-colors duration-300 w-16 shrink-0">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-headline italic text-tertiary text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors duration-200">{step.title}</h3>
                  <p className="text-on-surface-variant font-body leading-relaxed max-w-[50ch]">{step.body}</p>
                  {step.href && step.cta && (
                    <Link href={step.href} className="inline-flex items-center gap-2 mt-4 text-sm font-label font-bold text-primary uppercase tracking-widest border-b border-primary pb-0.5 hover:gap-4 transition-all duration-150">
                      {step.cta} <Icon name="arrow_forward" size="sm" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER — Dark, editorial, full-bleed ── */}
      <section className="content-lazy bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF4A6idYdLAiAOn2lGufidL7mH58z9Dl9U6DCQSIk8TWfSYtTxtlkiQQDMiGD0dQMNcN0K4f9TnML0dFaZKcrSasdY6DlgbD_GLYTKo0YVrUAAmy3p6ER2ghw34ejWevGFb6MIw3SxaZUMrh_RD82ah7f4ju3vB7Ty-XXPT3nuyjVy62nH-RW6V8Vw791yAHqXa1kLzReLRmNO1WvFXFb0-YiKOZVDQvL_8XyW_51rTOCafHePoX2YdXiwDuXCZ4hX5FkHSc_d-S3p"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-14 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-3 text-on-primary/40 font-label text-[11px] uppercase tracking-[0.3em] mb-8">
              <span className="w-8 h-px bg-on-primary/30 inline-block" />
              Field Notes
            </span>
            <h2
              className="font-headline italic text-on-primary leading-[0.95] tracking-tight mb-6"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              Grow with<br />the season.
            </h2>
            <p className="text-on-primary/60 font-body text-lg leading-relaxed max-w-[40ch]">
              Weekly harvest updates, seasonal recipes, and first access to small-batch releases — direct from the farmers.
            </p>
          </div>
          <div>
            <form className="space-y-4">
              <div>
                <label htmlFor="newsletter-email-home" className="block text-[11px] font-label font-bold uppercase tracking-widest text-on-primary/50 mb-3">
                  Your email address
                </label>
                <input
                  id="newsletter-email-home"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full bg-on-primary/10 border border-on-primary/20 text-on-primary placeholder:text-on-primary/30 px-5 py-4 rounded-xl font-body text-base focus:outline-none focus:border-on-primary/60 focus:-translate-y-px transition-all duration-150"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-secondary text-on-secondary px-8 py-4 rounded-xl font-label font-bold text-sm uppercase tracking-widest hover:bg-secondary/90 active:scale-[0.97] transition-all duration-150"
              >
                Subscribe to Field Notes
              </button>
            </form>
            <p className="text-on-primary/30 text-[11px] font-body mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </>
  );
}
