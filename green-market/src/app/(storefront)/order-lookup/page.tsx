import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function OrderLookupPage() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center px-4 py-16">
      {/* Header */}
      <div className="w-full bg-surface-container-low py-12 mb-12">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h1 className="text-5xl md:text-6xl font-headline text-tertiary mb-6 tracking-tight">
            Track Your Harvest
          </h1>
          <p className="text-lg text-on-surface-variant font-body leading-relaxed">
            Whether it&rsquo;s heirloom tomatoes or hand-turned butter, we&rsquo;re
            carefully preparing your local goodies for their journey from our
            fields to your table.
          </p>
        </div>
      </div>

      {/* Asymmetric Lookup Card */}
      <div className="relative w-full max-w-4xl grid md:grid-cols-12 gap-8 items-stretch">
        {/* Harvest Image */}
        <div className="md:col-span-5 relative h-64 md:h-auto min-h-[400px]">
          <div className="absolute inset-0 bg-surface-container-low rounded-xl overflow-hidden -rotate-2 transform transition-transform hover:rotate-0 duration-500">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBke-gdqjfW8Yk5iiExuyKd8nK-P_0tIu4E6m7Zvl6U20SjC9G9OaLXrS8fSbv9DD9Yx20BcEO71XbGx5F3PyTsQGh6cao-A8fTjMnW4yuOn2OBHAIJYFLp9-moviI3DcOUt9nAGbxClWenWDsirr5Ah562KWbAZLSVzPSVX6f0IKKwjUFWKL7IUUBew5B11jLwS5pvApHQYAGr09yIB1wJarr7X3CqtmtiJWqsb_-uiPl_VwoLyBBq90U_aHdzACuzoJfdZUBvKZHW"
              alt="Rustic wooden crate filled with vibrant organic vegetables"
              fill
              sizes="(max-width: 768px) 100vw, 42vw"
              className="object-cover opacity-90"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 p-6 bg-secondary-fixed rounded-full flex items-center justify-center text-on-secondary-fixed z-10 transform rotate-12">
            <Icon name="potted_plant" size="lg" />
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-7 bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-ambient">
          <div className="mb-10">
            <h2 className="text-2xl font-headline text-tertiary italic mb-2">
              Check Order Status
            </h2>
            <p className="text-sm text-on-surface-variant">
              Please enter the details from your confirmation receipt.
            </p>
          </div>

          <form className="space-y-8">
            <Input
              label="Order ID"
              type="text"
              placeholder="e.g. #GRN-8842"
              className="text-lg rounded-t-lg"
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="hello@example.com"
              className="text-lg rounded-t-lg"
            />

            <div className="pt-4 flex items-center gap-6">
              <Button className="flex-grow md:flex-none px-8 py-4 rounded-lg flex items-center justify-center gap-2">
                Locate My Order
                <Icon name="arrow_forward" size="sm" />
              </Button>
              <a
                href="#"
                className="text-sm font-label text-secondary hover:underline underline-offset-4 transition-all"
              >
                Need help?
              </a>
            </div>
          </form>

          {/* Status placeholder */}
          <div className="mt-12 p-6 bg-surface-container-low rounded-lg opacity-50">
            <div className="flex items-start gap-4">
              <div className="bg-primary-fixed p-2 rounded-full">
                <Icon name="local_shipping" className="text-primary" />
              </div>
              <div>
                <h4 className="font-headline text-lg text-primary">
                  Current Status
                </h4>
                <p className="text-sm text-on-surface-variant">
                  Enter your details above to see your harvest journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <section className="mt-24 w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <span className="inline-block px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-tighter rounded-full mb-4">
            The Hearth Way
          </span>
          <h3 className="text-3xl font-headline text-tertiary mb-4 leading-snug italic">
            &ldquo;Every basket we pack is a promise of quality,
            sustainability, and community.&rdquo;
          </h3>
          <p className="text-on-surface-variant text-sm font-body leading-relaxed">
            Our farmers start harvesting at dawn to ensure that when your order
            is &lsquo;Ready for Pickup&rsquo;, it&rsquo;s as fresh as the
            morning dew.
          </p>
        </div>
        <div className="order-1 md:order-2">
          <div className="aspect-square bg-surface-container rounded-full flex items-center justify-center p-8">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKGUWMhnipmlTiPT5EMbMIwzpwsw0fVRr1eaPhawbMB0emhDApJMCndKQ77wF7uEdJ4tMeiZ5QGzsxT3tq7T4lsPUFpmIvyQUB0CB7S3SPBrUF_k2XcRxbS6QloiDxGDZZUAzlGVXg9n-jPdKdPT3xXZZJ4KpYD-21W88jzA5-rWF21qE0nS8UbRsldBAL7E7RdTtH4m0T9v4VQ1nbWxniutqVY3jVibZaAiW08Vf0tu9P1ueFDDvgkYfnRRlLX8u2kWAHd2q81BZm"
              alt="Smiling farmer holding a fresh loaf of artisan bread"
              width={400}
              height={400}
              sizes="(max-width: 768px) 100vw, 40vw"
              loading="lazy"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
