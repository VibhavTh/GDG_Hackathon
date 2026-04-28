import Image from "next/image";

const team = [
  {
    name: "Ron Holdren",
    role: "The Fearless Leader",
    photo: "/about/team/ronald_gmf.jpg",
    blurb: "Founded the farm with his wife Lisa in 1991. Still in the greenhouses every day.",
  },
  { name: "Thomas", role: "The Master Farmer", photo: "/about/team/thomas_gmf.jpg" },
  { name: "Connor", role: "The Pretty Face", photo: null },
  { name: "Caroline", role: "The Healer", photo: null },
  { name: "Eleanor", role: "The Moral Compass", photo: null },
  {
    name: "Greta",
    role: "The Prodigal Daughter Yet to Return",
    photo: "/about/team/greta_gmf.jpg",
  },
];

const whatWeDo = [
  {
    title: "Blacksburg Farmer's Market",
    image: "/about/farmers-market.jpg",
    body: "Find us every Saturday at the Blacksburg Farmer's Market, and at all Wednesday markets during season.",
  },
  {
    title: "Farm Stand",
    image: "/about/farm-stand.jpg",
    body: "Come and check out our produce any day of the week in Pembroke at 6643 Virginia Avenue.",
  },
  {
    title: "Flowers",
    image: "/about/flowers.jpg",
    body: "GMF offers more than 30 varieties of flowers throughout the year, most notably mums and petunias.",
  },
  {
    title: "Greenhouses",
    image: "/about/greenhouses.jpg",
    body: "We maintain multiple greenhouses open to the public. Come check them out, and take some plants with you on the way out. We've got everything from rare plants for your home to starter sprouts for your fields.",
  },
  {
    title: "Specialty Crops",
    image: "/about/specialty-crops.jpg",
    body: "If you are a restaurant or business looking for a large quantity of something specific, we are willing to work with you and grow what you need. 4 to 6 months advance notice required.",
  },
  {
    title: "Ayers Orchard",
    image: "/about/ayers-orchard.jpg",
    body: "Green Market Farms works closely with Ayers Orchard in Cana, SC, to bring their delicious apples, peaches, tomatoes, and cherries to the Southwest VA locale.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── MISSION STATEMENT ── */}
      <section className="pt-40 md:pt-48 pb-24 md:pb-32 mx-6 md:mx-12 lg:mx-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-6 inline-flex items-center gap-2">
            <span className="w-5 h-px bg-secondary inline-block" />
            Our Story
          </span>
          <p className="font-headline italic text-3xl md:text-4xl text-tertiary leading-tight">
            We are Green Market Farms: a local, family owned farm with a local, community focused mission.
          </p>
        </div>
      </section>

      {/* ── RON HOLDREN NARRATIVE ── */}
      <section className="pb-24 md:pb-32 mx-6 md:mx-12 lg:mx-20">
        <div className="max-w-2xl mx-auto space-y-6 text-on-surface-variant font-body leading-relaxed">
          <p>
            Ron Holdren grew up watching his father and grandfather farm, and in 1991 he and his wife Lisa established their nursery, Green Market Farms, and began growing an assortment of bedding plants. In 2000 they added two gardens, one in Pembroke and the other in Newport on Ron&rsquo;s mother&rsquo;s land, to grow vegetables that they could sell at local farmers markets.
          </p>
          <p>
            Ron finds a lot of joy selling at the farmers market as he is a storyteller at heart, but he equally enjoys hearing about others&rsquo; adventures. He says, &ldquo;I learn a lot from the customers because we have international travelers visiting Blacksburg every week. I get to take an imaginary trip to Spain or hear about someone&rsquo;s trip to Prague for a music concert. You feel like you&rsquo;ve been on a trip after a conversation at the market. Also, one minute I am selling coriander to someone from Southeast Asia, and the next minute I am selling someone a jar of homemade plum preserves. The mixture of people gives you a sense of being involved with a world community even though I haven&rsquo;t left my home.&rdquo;
          </p>
          <p>
            Though he no longer attends the Blacksburg Farmer&rsquo;s Market in person, Ron is in the greenhouses every day. He spends his time caring for the plants and running the GMF Farm Stand.
          </p>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section className="py-24 md:py-32 bg-surface-container-low rounded-t-[3rem]">
        <div className="mx-6 md:mx-12 lg:mx-20">
          <div className="text-center mb-16">
            <span className="text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-4 inline-block">
              What We Do
            </span>
            <h2 className="font-headline italic text-4xl md:text-5xl text-tertiary leading-tight">
              Green Market Farms
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whatWeDo.map((item) => (
              <div
                key={item.title}
                className="bg-surface rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-surface-container-highest">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="font-headline italic text-2xl text-tertiary mb-3">
                    {item.title}
                  </h3>
                  <p className="font-body text-on-surface-variant leading-relaxed text-sm">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-24 md:py-32 mx-6 md:mx-12 lg:mx-20">
        <div className="mb-16 md:mb-20 max-w-4xl">
          <span className="inline-flex items-center gap-2 text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-4">
            <span className="w-5 h-px bg-secondary inline-block" />
            Our People
          </span>
          <h2 className="font-headline italic text-4xl md:text-5xl lg:text-6xl text-tertiary leading-[1.05]">
            Meet the Green Market Farmers.
          </h2>
          <p className="font-body text-on-surface-variant mt-6 max-w-prose leading-relaxed">
            The folks behind every basket of cherries, every flat of petunias, and every Saturday morning at the market.
          </p>
        </div>

        <div className="space-y-8 md:space-y-12">
          {team.map((member, i) => {
            const reverse = i % 2 === 1;
            return (
              <article
                key={member.name}
                className={`bg-surface-container-low rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[2fr_3fr] ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px] bg-surface-container-highest">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-contain"
                    />
                  ) : null}
                </div>
                <div className="p-10 md:p-14 lg:p-16 flex flex-col justify-center">
                  {i === 0 && (
                    <span className="font-label text-[11px] uppercase tracking-[0.25em] text-secondary mb-5">
                      Founder
                    </span>
                  )}
                  <h3 className="font-headline italic text-5xl md:text-6xl text-tertiary leading-[1.05] mb-3">
                    {member.name}
                  </h3>
                  <p className="font-headline italic text-xl md:text-2xl text-secondary mb-6">
                    {member.role}
                  </p>
                  {member.blurb && (
                    <p className="font-body text-on-surface-variant leading-relaxed max-w-md">
                      {member.blurb}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
