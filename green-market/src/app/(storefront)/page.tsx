import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import { EventCountdown } from "@/components/ui/event-countdown";
import { createServiceClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const service = createServiceClient();

  const { data: featuredProducts } = await service
    .from("products")
    .select("id, name, price, description, image_url, unit")
    .eq("is_active", true)
    .is("deleted_at", null)
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: productCount } = await service
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .is("deleted_at", null);

  const { data: upcomingEvents } = await service
    .from("events")
    .select("id, title, description, event_date, event_time, location")
    .eq("is_published", true)
    .gte("event_date", new Date().toISOString().slice(0, 10))
    .order("event_date", { ascending: true })
    .limit(20);

  const featured = featuredProducts ?? [];
  const events = upcomingEvents ?? [];

  // Group additional dates for the same event title as the soonest event
  const nextEvent = events[0] ?? null;
  const additionalDates = nextEvent
    ? events
        .slice(1)
        .filter((e) => e.title === nextEvent.title)
        .map((e) => ({ date: e.event_date, time: e.event_time }))
    : [];

  return (
    <>
      {/* ── HERO — Split screen, left text / right image ── */}
      <section className="min-h-[100dvh] grid grid-cols-1 md:grid-cols-2">
        {/* Left — content */}
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-28 pb-16 md:pt-0 md:pb-0 bg-surface">
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-2 text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-8 animate-slide-up" style={{ animationDelay: "0ms" }}>
              <span className="w-6 h-px bg-secondary inline-block" />
              Giles Co, VA -- Blacksburg Farmers Market
            </span>

            <h1 className="font-headline italic text-tertiary leading-[1.05] tracking-tight mb-8 animate-slide-up" style={{ animationDelay: "80ms" }}>
              <span className="block text-5xl md:text-6xl lg:text-7xl">Fresh</span>
              <span className="block text-5xl md:text-6xl lg:text-7xl text-primary">from our</span>
              <span className="block text-5xl md:text-6xl lg:text-7xl">fields and flowers.</span>
            </h1>

            <p className="text-on-surface-variant font-body text-lg leading-relaxed max-w-[52ch] mb-10 animate-slide-up" style={{ animationDelay: "160ms" }}>
              Fresh produce, flowers, and nursery plants from our farm in Giles County. Find us every week at the Blacksburg Farmers Market.
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-slide-up" style={{ animationDelay: "240ms" }}>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-label font-bold text-sm uppercase tracking-widest hover:bg-primary/90 active:scale-[0.97] transition-all duration-150"
              >
                Shop Now
                <Icon name="arrow_forward" size="sm" />
              </Link>
              <Link
                href="#about"
                className="inline-flex items-center gap-2 text-tertiary/70 font-label font-bold text-sm uppercase tracking-widest hover:text-tertiary transition-colors duration-150"
              >
                Our Story
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-16 pt-10 border-t border-outline-variant/40 grid grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "320ms" }}>
              {[
                { value: "Giles Co", label: "Virginia" },
                { value: `${productCount ?? "0"}+`, label: "Products" },
                { value: "Local", label: "& Sustainable" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-headline italic text-2xl text-secondary mb-1">{stat.value}</p>
                  <p className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — full-bleed image with overlay card */}
        <div className="relative min-h-[60vw] md:min-h-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/farm.png"
            alt="Rows of crops growing at a fruit and vegetable farm in Giles County, Virginia"
            className="absolute inset-0 w-full h-full object-cover"
          />

        </div>
      </section>

      {/* ── UPCOMING EVENT COUNTDOWN ── */}
      {events.length > 0 && (
        <section className="content-lazy">
          <EventCountdown
            eventDate={events[0].event_date}
            eventTime={events[0].event_time}
            eventTitle={events[0].title}
            eventDescription={events[0].description}
            eventLocation={events[0].location}
            additionalDates={additionalDates}
          />
        </section>
      )}

      {/* ── FEATURED PRODUCTS — Asymmetric bento ── */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto content-lazy">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-4 mb-12">
          <div>
            <span className="text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-3 block">
              Local Picks
            </span>
            <h2 className="font-headline italic text-4xl md:text-5xl text-tertiary leading-tight">
              What&rsquo;s ready now
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 font-label font-bold text-sm text-primary uppercase tracking-wider hover:gap-3 transition-all duration-150 mb-2"
          >
            All Products <Icon name="arrow_forward" size="sm" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="py-24 text-center bg-surface-container-low rounded-2xl">
            <Icon name="eco" className="text-5xl text-on-surface-variant/40 mb-4" />
            <p className="font-headline italic text-2xl text-tertiary mb-2">More coming soon.</p>
            <p className="text-on-surface-variant font-body mb-6">We are adding fresh produce, flowers, and plants. Check back shortly.</p>
            <Link href="/products" className="text-primary font-bold text-sm hover:underline">Browse the catalog</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 stagger-children">
            {/* Large hero card — col-span-7 */}
            {featured[0] && (() => {
              const p = featured[0];
              return (
                <div className="md:col-span-7 group relative overflow-hidden rounded-2xl bg-surface-container-highest min-h-[420px] animate-slide-up-fast">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 58vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-tertiary/90 via-tertiary/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <Link href={`/products/${p.id}`}>
                      <h3 className="font-headline italic text-3xl md:text-4xl text-on-tertiary leading-tight mb-2 hover:text-on-tertiary/80 transition-colors duration-150">
                        {p.name}
                      </h3>
                    </Link>
                    {p.description && (
                      <p className="text-on-tertiary/70 font-body text-sm line-clamp-2 mb-5 max-w-[40ch]">
                        {p.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="font-headline text-2xl text-on-tertiary">
                        ${(p.price / 100).toFixed(2)}
                        {p.unit && <span className="text-sm font-body opacity-60 ml-1">/ {p.unit}</span>}
                      </p>
                      <AddToCartButton
                        item={{ productId: p.id, name: p.name, price: p.price / 100, image: p.image_url ?? "", unit: p.unit ?? "each" }}
                        className="w-auto px-6"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Right column — stacked smaller cards — col-span-5 */}
            <div className="md:col-span-5 flex flex-col gap-4">
              {featured.slice(1, 3).map((p, i) => {
                return (
                  <div key={p.id} className="group bg-surface-container-low rounded-2xl p-6 flex gap-5 items-center hover:bg-surface-container transition-colors duration-150 animate-slide-up-fast" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container-highest shrink-0 relative">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          sizes="96px"
                          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline-variant">
                          <Icon name="image" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${p.id}`} className="hover:underline">
                        <h4 className="font-headline italic text-xl text-tertiary leading-tight mb-1">{p.name}</h4>
                      </Link>
                      {p.description && (
                        <p className="text-xs text-on-surface-variant line-clamp-1 mb-3">{p.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-headline text-lg text-primary">
                          ${(p.price / 100).toFixed(2)}
                          {p.unit && <span className="text-xs font-body text-on-surface-variant ml-1">/ {p.unit}</span>}
                        </span>
                        <AddToCartButton
                          variant="underline"
                          item={{ productId: p.id, name: p.name, price: p.price / 100, image: p.image_url ?? "", unit: p.unit ?? "each" }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 4th product or CTA card */}
              {featured[3] ? (() => {
                const p = featured[3];
                return (
                  <div className="group bg-surface-container rounded-2xl overflow-hidden flex-1 flex items-end relative min-h-[160px] animate-slide-up-fast" style={{ animationDelay: "240ms" }}>
                    {p.image_url && (
                      <>
                        <Image src={p.image_url} alt={p.name} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-tertiary/80 to-tertiary/20" />
                      </>
                    )}
                    <div className="relative z-10 p-6 flex items-end justify-between w-full">
                      <div>
                        <Link href={`/products/${p.id}`}>
                          <h4 className="font-headline italic text-xl text-on-tertiary hover:text-on-tertiary/80 transition-colors duration-150">{p.name}</h4>
                        </Link>
                        <p className="font-headline text-lg text-on-tertiary mt-1">${(p.price / 100).toFixed(2)}</p>
                      </div>
                      <AddToCartButton
                        item={{ productId: p.id, name: p.name, price: p.price / 100, image: p.image_url ?? "", unit: p.unit ?? "each" }}
                        className="w-auto px-5 shrink-0"
                      />
                    </div>
                  </div>
                );
              })() : (
                <div className="bg-surface-container-low rounded-2xl p-6 flex-1 flex flex-col items-center justify-center text-center animate-slide-up-fast" style={{ animationDelay: "240ms" }}>
                  <p className="font-headline italic text-xl text-tertiary mb-4">More coming soon.</p>
                  <Link href="/products" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label font-bold text-xs uppercase tracking-widest hover:bg-primary/90 active:scale-[0.97] transition-all duration-150">
                    Browse All
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── ABOUT — Left image / Right editorial text ── */}
      <section id="about" className="py-24 bg-surface-container-low content-lazy">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden">
          {/* Image side */}
          <div className="relative min-h-[400px]">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdTkBD3e3jg4WHXjb9bdU_sPBNGwO1wDJDAPshqnsxUJu9VkZ_VS5RYAQMijA9NqjbcuAJ3XVYIy85_H1-vzA8LViTOuu9QMNb0CzbmqyBWEcmQ684tQ6ZpCc_wARQ802sUj-s5N6WRed9RmQnYBIqRxsNbHjymV5Eiqy8itpCaGY8XtAcwb1lJdxuDrKWYLfRHySVdEkfCzJeQELAWTXg_YuhLYhify456UG81upBPXdvbZb00zTGgUDyHgC7vQcXiVACJ3IShg5P"
              alt="Rustic wooden table covered in freshly harvested organic vegetables"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              className="object-cover"
            />
          </div>

          {/* Text side */}
          <div className="bg-surface-container p-12 md:p-16 flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-6">
              <span className="w-5 h-px bg-secondary inline-block" />
              Our Mission
            </span>
            <h2 className="font-headline italic text-4xl md:text-5xl text-tertiary leading-tight mb-6">
              Grown in Giles County.
            </h2>
            <div className="space-y-5 text-on-surface-variant font-body leading-relaxed">
              <p>
                We grow fresh produce, cut flowers, and nursery plants in Giles County, Virginia. Everything is grown locally and sustainably -- no shortcuts, no middlemen.
              </p>
              <p>
                You can find us each week at the Blacksburg Farmers Market, or order here for pickup directly from the farm.
              </p>
            </div>
            <div className="mt-10 pt-8 border-t border-outline-variant/30 flex gap-10">
              {[
                { value: "Giles Co, VA", label: "Grown here" },
                { value: "Sustainable", label: "Local & responsible" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="font-headline italic text-tertiary text-lg mb-0.5">{item.value}</p>
                  <p className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — Horizontal asymmetric ── */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto content-lazy">
        <div className="mb-14">
          <span className="text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-3 block">
            Simple by design
          </span>
          <h2 className="font-headline italic text-4xl md:text-5xl text-tertiary">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-6">
          {/* Step 1 — large */}
          <div className="bg-surface-container-low rounded-2xl p-10">
            <span className="inline-block font-headline italic text-6xl text-primary/20 mb-4">01</span>
            <h3 className="font-headline italic text-2xl text-tertiary mb-3">Browse the shop</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              Browse our current harvest -- produce, flowers, and nursery plants grown right here in Giles County. Filter by category or search for what you need.
            </p>
            <Link href="/products" className="inline-flex items-center gap-2 mt-6 text-sm font-label font-bold text-primary uppercase tracking-widest hover:gap-3 transition-all duration-150">
              Shop now <Icon name="arrow_forward" size="sm" />
            </Link>
          </div>

          {/* Step 2 */}
          <div className="bg-primary-container/30 rounded-2xl p-8">
            <span className="inline-block font-headline italic text-6xl text-primary/30 mb-4">02</span>
            <h3 className="font-headline italic text-xl text-tertiary mb-3">Add to your basket</h3>
            <p className="text-on-surface-variant font-body text-sm leading-relaxed">
              Browse fresh items from our farm and add them to your basket.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-secondary-fixed/20 rounded-2xl p-8">
            <span className="inline-block font-headline italic text-6xl text-secondary/20 mb-4">03</span>
            <h3 className="font-headline italic text-xl text-tertiary mb-3">Pick up or get delivery</h3>
            <p className="text-on-surface-variant font-body text-sm leading-relaxed">
              Choose farm pickup or home delivery at checkout. Pay securely, then track your order from preparation to your door.
            </p>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER — Full bleed, editorial ── */}
      <section className="content-lazy">
        <div className="bg-primary mx-6 md:mx-12 mb-24 rounded-3xl overflow-hidden relative">
          {/* Background image, darkened */}
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

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            <div className="p-12 md:p-16">
              <span className="inline-flex items-center gap-2 text-on-primary/60 font-label text-[11px] uppercase tracking-[0.25em] mb-6">
                <span className="w-5 h-px bg-on-primary/40 inline-block" />
                The Weekly Harvest
              </span>
              <h2 className="font-headline italic text-4xl md:text-5xl text-on-primary leading-tight mb-4">
                Grow with the season.
              </h2>
              <p className="text-on-primary/70 font-body leading-relaxed">
                Weekly updates, seasonal recipes, and first access to small batch releases, direct from our farm.
              </p>
            </div>

            <div className="px-12 pb-12 md:px-16 md:py-16">
              <NewsletterForm id="newsletter-email-home" variant="dark" />
              <p className="text-on-primary/40 text-[11px] font-body mt-3">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
