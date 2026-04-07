import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";

export default function HomePage() {
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
          <span className="text-secondary font-label text-sm uppercase tracking-[0.2em] mb-4 block">
            Hand-Sown, Heart-Grown
          </span>
          <h1 className="text-6xl md:text-8xl font-headline italic text-tertiary leading-[1.1] mb-8">
            Grown with the <br />
            <span className="text-primary not-italic font-bold">
              Rhythm of Nature.
            </span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl font-body max-w-lg mb-10 leading-relaxed">
            A marketplace for local growers — discover seasonal produce, small-batch goods, and farm-fresh staples from farmers in your community.
          </p>
          <div className="flex flex-wrap gap-4">
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
      <section className="py-24 px-6 max-w-7xl mx-auto content-lazy">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Large Feature: Honey */}
          <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-xl bg-surface-container-highest">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxoINOaTTuQTRvBS8DkhirM6kWTSR4_KcbCBnyrr-HPpb2MVUIZ2zuE6l_4vVqOsx_5oG-iZc6J10a8AGcCmurxMeEgfYrJNQLvCD9-GG1gvoVKCwB9EVnUJlZxNaR2QF6aT3zCZaV1HpGBfXnT_HDfggAAq1DzzeOKOa9Ml_OgAf0SEb8z8iih42HQn3bjDU4jKCbheLfEk1hPVk6E65j9x4XVyYvpj2EE6xksUEEhxtyhjC9YQ9Svgb8cxqGmHTBKHAqTaiX6sp_"
              alt="Golden artisanal honey jar with a handwritten paper label"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tertiary/80 via-transparent to-transparent p-8 flex flex-col justify-end">
              <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] uppercase font-bold px-3 py-1 rounded-full w-fit mb-3">
                Limited Batch
              </span>
              <h3 className="text-3xl font-headline text-on-tertiary italic mb-2">
                Wildflower Blossom Honey
              </h3>
              <p className="text-on-tertiary-container font-body mb-6">
                Raw, unfiltered, and deeply floral nectar from a local
                meadow apiary.
              </p>
              <AddToCartButton
                item={{
                  productId: "featured-honey",
                  name: "Wildflower Blossom Honey",
                  price: 24,
                  image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxoINOaTTuQTRvBS8DkhirM6kWTSR4_KcbCBnyrr-HPpb2MVUIZ2zuE6l_4vVqOsx_5oG-iZc6J10a8AGcCmurxMeEgfYrJNQLvCD9-GG1gvoVKCwB9EVnUJlZxNaR2QF6aT3zCZaV1HpGBfXnT_HDfggAAq1DzzeOKOa9Ml_OgAf0SEb8z8iih42HQn3bjDU4jKCbheLfEk1hPVk6E65j9x4XVyYvpj2EE6xksUEEhxtyhjC9YQ9Svgb8cxqGmHTBKHAqTaiX6sp_",
                  unit: "jar",
                }}
                className="w-fit px-6"
              />
            </div>
          </div>

          {/* Product 2 */}
          <div className="bg-surface-container-low p-6 rounded-xl group">
            <div className="overflow-hidden rounded-lg aspect-square mb-6">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtJLG0XmmwmY5QooEx4izYbE5OqTbwB0iHvp0dwnwSVQ4BxhiLKKlNKnRRGALqs7PjIuVJXYxvAyD4UjBcatrUfCTeKsfca4hs1krrLiLNvcFV4zIHpdxVBOvaGipW9L297UWO8yOJM-0qoNGCku9C_tf04Enr0deGkTdIMSD6UOFlObOO4caJBGbWNuX-5RP6KADJWQbhSgBcE0ndRZEBV0v6hAUCQ5Faux158L-6Y263JKaTppqanXgzmxLQFentNQ0r6p-qIbfx"
                alt="Vibrant purple heirloom carrots"
                width={400}
                height={400}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-headline text-xl text-tertiary italic">
                Purple Heirloom Carrots
              </h4>
              <span className="text-primary font-bold">$6.50</span>
            </div>
            <p className="text-sm text-on-surface-variant font-body mb-4">
              Earthy and crisp with a stunning royal hue.
            </p>
            <AddToCartButton
              variant="underline"
              item={{
                productId: "featured-carrots",
                name: "Purple Heirloom Carrots",
                price: 6.5,
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtJLG0XmmwmY5QooEx4izYbE5OqTbwB0iHvp0dwnwSVQ4BxhiLKKlNKnRRGALqs7PjIuVJXYxvAyD4UjBcatrUfCTeKsfca4hs1krrLiLNvcFV4zIHpdxVBOvaGipW9L297UWO8yOJM-0qoNGCku9C_tf04Enr0deGkTdIMSD6UOFlObOO4caJBGbWNuX-5RP6KADJWQbhSgBcE0ndRZEBV0v6hAUCQ5Faux158L-6Y263JKaTppqanXgzmxLQFentNQ0r6p-qIbfx",
                unit: "bunch",
              }}
            />
          </div>

          {/* Product 3 */}
          <div className="bg-surface-container-low p-6 rounded-xl group">
            <div className="overflow-hidden rounded-lg aspect-square mb-6">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuArNJHgAnEJg1xCsICaESXJwrnM5ol02yIbZA4CZ1syy-ZI6t1RegVbqeSMj6bLIaafZL6gzRp8ZnDdfJX93HUnsSPeXWmhsEVb8zi6o0ag3nSk-TFmPpaLzu5vpmWJ420P8IhQgGpiUTG1Xay33VpkfRJG_TNK4P-9-BNDoLWY9ifOoC0tiFhNQsPSm1mqH4wSwNJI5RJ00_RXaF6MDYunzsBoXVBhyetDy7uLJKbPYnbyZP7lkSafQsg37lFrJ4SZyJs-0i-29lYC"
                alt="Rustic basket of organic garden kale"
                width={400}
                height={400}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-headline text-xl text-tertiary italic">
                Lacinato Kale Bunch
              </h4>
              <span className="text-primary font-bold">$4.00</span>
            </div>
            <p className="text-sm text-on-surface-variant font-body mb-4">
              Harvested morning-of for maximum nutrient density.
            </p>
            <AddToCartButton
              variant="underline"
              item={{
                productId: "featured-kale",
                name: "Lacinato Kale Bunch",
                price: 4.0,
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuArNJHgAnEJg1xCsICaESXJwrnM5ol02yIbZA4CZ1syy-ZI6t1RegVbqeSMj6bLIaafZL6gzRp8ZnDdfJX93HUnsSPeXWmhsEVb8zi6o0ag3nSk-TFmPpaLzu5vpmWJ420P8IhQgGpiUTG1Xay33VpkfRJG_TNK4P-9-BNDoLWY9ifOoC0tiFhNQsPSm1mqH4wSwNJI5RJ00_RXaF6MDYunzsBoXVBhyetDy7uLJKbPYnbyZP7lkSafQsg37lFrJ4SZyJs-0i-29lYC",
                unit: "bunch",
              }}
            />
          </div>

          {/* Horizontal Banner Product */}
          <div className="md:col-span-2 bg-surface-container p-8 rounded-xl flex flex-col md:flex-row items-center gap-8 group">
            <div className="flex-1">
              <span className="text-secondary font-label text-[10px] uppercase tracking-widest font-bold block mb-2">
                Seasonal Special
              </span>
              <h4 className="text-3xl font-headline text-tertiary mb-3 italic">
                The Kitchen Hearth Box
              </h4>
              <p className="text-on-surface-variant mb-6 text-sm">
                A weekly curated selection of what&rsquo;s peaking across our local
                farms this week. Perfect for a family of four.
              </p>
              <button className="px-6 py-3 bg-primary text-on-primary rounded-md font-bold text-sm transition-transform active:scale-95">
                Subscribe - $45/week
              </button>
            </div>
            <div className="w-full md:w-1/2 aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF4A6idYdLAiAOn2lGufidL7mH58z9Dl9U6DCQSIk8TWfSYtTxtlkiQQDMiGD0dQMNcN0K4f9TnML0dFaZKcrSasdY6DlgbD_GLYTKo0YVrUAAmy3p6ER2ghw34ejWevGFb6MIw3SxaZUMrh_RD82ah7f4ju3vB7Ty-XXPT3nuyjVy62nH-RW6V8Vw791yAHqXa1kLzReLRmNO1WvFXFb0-YiKOZVDQvL_8XyW_51rTOCafHePoX2YdXiwDuXCZ4hX5FkHSc_d-S3p"
                alt="Wooden crate filled with colorful farm fresh produce"
                width={600}
                height={450}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
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
