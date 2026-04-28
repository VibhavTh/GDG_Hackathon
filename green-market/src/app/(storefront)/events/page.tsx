import { Suspense } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { EventCountdown } from "@/components/ui/event-countdown";
import { getUpcomingEvents } from "@/lib/queries/products";

const seasonalLocations = [
  {
    name: "Greenhouse and Farm Stand",
    image: "/events/greenhousefarmstand_gmf.jpg",
    address: ["6643 Virginia Avenue", "Pembroke, Virginia 24136"],
    status: "Closed for the winter",
    statusTone: "closed" as const,
    note: "Tentatively opening for the season in April.",
    hours: null,
  },
  {
    name: "The Blacksburg Farmer's Market",
    image: "/events/blacksburgfarmersmarket_gmf.jpg",
    address: ["108 W Roanoke St", "Blacksburg, VA 24060"],
    status: "Open",
    statusTone: "open" as const,
    note: null,
    hours: ["Saturday 10am to 2pm"],
  },
  {
    name: "Fruit Stand at Annie Kay's",
    image: "/events/anniekays_gmf.jpg",
    address: ["1531 S Main St", "Blacksburg, VA 24060"],
    status: "Closed for the season",
    statusTone: "closed" as const,
    note: "Tentatively opening on Saturdays starting in April.",
    hours: null,
  },
];

const yearRound = {
  name: "Oasis World Market",
  blurb: "Find our produce and jams for sale at the Oasis World Market, seven days a week, almost every day of the year.",
  address: ["1411 South Main St.", "Blacksburg, VA 24060"],
  hours: ["Sun to Wed: 10am to 7pm", "Thu, Fri, Sat: 10am to 8pm"],
  href: "https://www.oasiswm.com/",
};

export default function EventsPage() {
  return (
    <Suspense fallback={null}>
      <EventsContent />
    </Suspense>
  );
}

async function EventsContent() {
  const events = await getUpcomingEvents();
  const nextEvent = events[0] ?? null;
  const additionalDates = nextEvent
    ? events
        .slice(1)
        .filter((e) => e.title === nextEvent.title)
        .map((e) => ({ date: e.event_date, time: e.event_time }))
    : [];

  return (
    <>
      {/* ── NEXT EVENT ── */}
      {nextEvent ? (
        <section className="-mt-4 md:-mt-6 content-lazy">
          <EventCountdown
            eventDate={nextEvent.event_date}
            eventTime={nextEvent.event_time}
            eventTitle={nextEvent.title}
            eventDescription={nextEvent.description}
            eventLocation={nextEvent.location}
            additionalDates={additionalDates}
          />
        </section>
      ) : (
        <section className="pb-8 mx-6 md:mx-12 lg:mx-20">
          <div className="max-w-2xl mx-auto bg-surface-container-low rounded-2xl p-12 text-center">
            <Icon name="event_busy" className="text-5xl text-on-surface-variant/40 mb-4" />
            <p className="font-headline italic text-2xl text-tertiary mb-2">
              No upcoming events.
            </p>
            <p className="font-body text-on-surface-variant">
              Check back later for the next farmers market or farm stand opening.
            </p>
          </div>
        </section>
      )}

      {/* ── SEASONAL LOCATIONS ── */}
      <section className="pt-10 md:pt-12 pb-24 md:pb-32 mx-6 md:mx-12 lg:mx-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-4 inline-block">
            Locations and Current Hours
          </span>
          <p className="font-headline italic text-2xl md:text-3xl text-tertiary leading-tight">
            As a seasonal business, the Green Market isn&rsquo;t everywhere year round. Here&rsquo;s where, and when, to find us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {seasonalLocations.map((loc) => {
            const statusClass =
              loc.statusTone === "open"
                ? "bg-primary text-on-primary"
                : "bg-on-surface/85 text-surface";
            return (
              <article
                key={loc.name}
                className="bg-surface-container-low rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-surface-container-highest">
                  <Image
                    src={loc.image}
                    alt={loc.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <span
                    className={`absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-label font-bold uppercase tracking-widest ${statusClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${loc.statusTone === "open" ? "bg-on-primary" : "bg-surface"}`} />
                    {loc.status}
                  </span>
                </div>
                <div className="p-7 md:p-8 flex flex-col flex-1">
                  <h2 className="font-headline italic text-2xl text-tertiary mb-4">
                    {loc.name}
                  </h2>
                  <address className="not-italic font-body text-on-surface-variant text-sm leading-relaxed mb-3">
                    {loc.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                  {loc.hours && (
                    <ul className="font-body text-on-surface text-sm leading-relaxed space-y-0.5">
                      {loc.hours.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}
                  {loc.note && (
                    <p className="font-body text-xs text-on-surface-variant/80 mt-auto pt-4">
                      {loc.note}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── YEAR ROUND ── */}
      <section className="py-24 md:py-32 bg-surface-container-low rounded-t-[3rem]">
        <div className="mx-6 md:mx-12 lg:mx-20">
          <div className="text-center mb-12">
            <span className="text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-4 inline-block">
              Year Round
            </span>
            <h2 className="font-headline italic text-4xl md:text-5xl text-tertiary leading-tight">
              Where to find us, every season.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="bg-surface rounded-2xl p-10 md:p-12 flex flex-col order-2 md:order-1">
              <h3 className="font-headline italic text-3xl text-tertiary mb-4">
                {yearRound.name}
              </h3>
              <p className="font-body text-on-surface-variant leading-relaxed mb-8">
                {yearRound.blurb}
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8 font-body text-sm">
                <div>
                  <p className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/70 mb-2">
                    Location
                  </p>
                  <address className="not-italic text-on-surface leading-relaxed">
                    {yearRound.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </div>
                <div>
                  <p className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/70 mb-2">
                    Hours
                  </p>
                  <ul className="text-on-surface leading-relaxed space-y-0.5">
                    {yearRound.hours.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <a
                href={yearRound.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex self-start items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label font-bold text-sm uppercase tracking-widest hover:bg-primary/90 active:scale-[0.97] transition-all duration-150 mt-auto"
              >
                Visit site
                <Icon name="arrow_outward" size="sm" />
              </a>
            </div>
            <div className="bg-surface rounded-2xl overflow-hidden relative aspect-[4/3] md:aspect-auto md:min-h-[480px] order-1 md:order-2">
              <Image
                src="/events/oasisworldmarket.jpg"
                alt="Oasis World Market storefront"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
