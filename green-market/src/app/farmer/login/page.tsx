import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function FarmerLoginPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Visual Storytelling Column */}
      <section className="hidden md:flex md:w-5/12 lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVmECiXzUTd-80c4bDsTm40mB9pwbSulNo6zk1ruWIzXgbcoRLvNR_nBJ0S2gz_C7GyaWPOtxdj_k_fSMxgV0D2-BlUP1Eokpd6z4pJTfcG1jokDlI_cG2G3xQdnD427tqAjFugKAZkzndTNS03gKqfwBFpfL-cQZzQdJtZ-OWtCFUbgOUga6wi_3VQ6TZ9iG1YJNDWw45jqUAG9zbKgv7Igy2X3ywJ0yXXeTU28u5AaxKVQipKSpbhm_EFiP8oGwi8ZgGxdRFIxzI"
            alt="Rolling green farm landscape at dawn"
            fill
            sizes="(max-width: 1024px) 42vw, 50vw"
            className="object-cover opacity-60 mix-blend-multiply"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-80" />
        </div>

        <div className="relative z-10 max-w-lg">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label text-xs tracking-widest uppercase mb-6">
            Est. 2024
          </span>
          <h1 className="font-headline italic text-5xl lg:text-7xl text-surface leading-tight mb-6">
            Cultivating the future of agricultural commerce.
          </h1>
          <p className="font-body text-surface/80 text-lg leading-relaxed max-w-md">
            Join a community of growers dedicated to sustainable, farm-to-table
            excellence. Access your dashboard to manage harvest, inventory, and
            logistics.
          </p>
          <div className="mt-12 flex items-center gap-4 text-surface/60">
            <div className="h-[1px] w-12 bg-surface/20" />
            <span className="font-label text-xs uppercase tracking-widest">
              The Green Market Farm
            </span>
          </div>
        </div>
      </section>

      {/* Authentication Form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-12">
            <span className="font-headline italic text-2xl text-tertiary">
              The Green Market Farm
            </span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="font-headline font-semibold text-3xl text-on-surface mb-2">
              Welcome Back
            </h2>
            <p className="text-on-surface-variant font-body">
              Please enter your credentials to access your dashboard.
            </p>
          </div>

          <form className="space-y-6">
            <div className="space-y-1.5">
              <label
                className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all duration-300 py-3 px-0 font-body placeholder:text-outline"
                id="email"
                name="email"
                placeholder="farmer@greenmarket.farm"
                required
                type="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <label
                  className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  className="text-xs font-body text-secondary hover:text-primary transition-colors duration-300"
                  href="#"
                >
                  Forgot?
                </a>
              </div>
              <input
                className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all duration-300 py-3 px-0 font-body placeholder:text-outline"
                id="password"
                name="password"
                placeholder="••••••••••••"
                required
                type="password"
              />
            </div>

            {/* Security Badge */}
            <div className="bg-surface-container-low rounded-lg p-4 flex items-start gap-4">
              <Icon name="verified_user" className="text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Enhanced Security Active
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  You will be prompted for 2FA / OTP verification after
                  providing valid credentials.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                className="rounded-sm border-outline text-primary focus:ring-primary h-4 w-4"
                id="remember"
                type="checkbox"
              />
              <label
                className="text-sm text-on-surface-variant font-body select-none"
                htmlFor="remember"
              >
                Stay signed in for 30 days
              </label>
            </div>

            <div className="pt-4 space-y-4">
              <button
                className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label font-bold py-4 rounded-xl shadow-ambient hover:opacity-90 active:scale-95 transition-all duration-200 uppercase tracking-widest text-sm"
                type="submit"
              >
                Access Dashboard
              </button>
              <Link
                href="/farmer/register"
                className="block w-full bg-surface-container-highest text-primary font-label font-bold py-4 rounded-xl hover:bg-surface-variant active:scale-95 transition-all duration-200 uppercase tracking-widest text-sm text-center"
              >
                Register New Farm
              </Link>
            </div>
          </form>

          {/* Footer */}
          <footer className="mt-16 pt-8 flex flex-col items-center md:items-start gap-6">
            <div className="flex gap-6">
              <a
                className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 hover:text-primary transition-colors"
                href="#"
              >
                Privacy
              </a>
              <a
                className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 hover:text-primary transition-colors"
                href="#"
              >
                Terms
              </a>
              <a
                className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 hover:text-primary transition-colors"
                href="#"
              >
                Support
              </a>
            </div>
            <p className="font-headline italic text-on-surface-variant/40 text-sm">
              &copy; 2024 The Green Market Farm. Cultivated with care.
            </p>
          </footer>
        </div>

        {/* Decorative Harvest Card */}
        <div className="hidden xl:block absolute top-12 right-12 w-48 h-64 bg-surface-container-low rounded-xl rotate-3 shadow-ambient overflow-hidden p-3">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8BouBxs1X3Bk8O7ohqZoXlNENEbKY55IfMyjEI2_FQM0SXN7_Itju-Esv9kU_b3B5OJrG5FselGupx3euI5O1IpuoSjTADcGVIWJjEE_c_adgu1UsYIIjoIZhVP-veOyAhLi2uYfeJmCcoLI4TRYA5TBYWXc102Dxdnb30e2D1AfuqeM3YI6tgrv2eISAizpHleuy-i4cxcWFrBO88IKfOWoZW4GmdSm74ZfhgFKuZ9TsT-cSgmJts5FCx8l-VDGf7qMe7SrpEcd0"
            alt="Rustic crate filled with heirloom tomatoes and greens"
            width={192}
            height={160}
            sizes="192px"
            loading="lazy"
            className="w-full h-40 object-cover rounded-lg mb-3"
          />
          <span className="block font-headline italic text-tertiary text-sm">
            Today&rsquo;s Harvest
          </span>
          <span className="block font-label text-[10px] uppercase text-on-surface-variant/60 mt-1">
            Batch #402-A
          </span>
        </div>
      </section>
    </main>
  );
}
