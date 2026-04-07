import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { register } from "./actions";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function FarmerRegisterPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Visual Column */}
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
            Join the Market
          </span>
          <h1 className="font-headline italic text-5xl lg:text-7xl text-surface leading-tight mb-6">
            Your farm deserves a wider table.
          </h1>
          <p className="font-body text-surface/80 text-lg leading-relaxed max-w-md">
            List your products, manage orders, and reach more customers in your
            community. Setup takes under five minutes.
          </p>
          <div className="mt-12 flex items-center gap-4 text-surface/60">
            <div className="h-[1px] w-12 bg-surface/20" />
            <span className="font-label text-xs uppercase tracking-widest">
              The Green Market Farm
            </span>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-12">
            <span className="font-headline italic text-2xl text-tertiary">
              The Green Market Farm
            </span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="font-headline font-semibold text-3xl text-on-surface mb-2">
              Register Your Farm
            </h2>
            <p className="text-on-surface-variant font-body">
              Create your account and start listing products today.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-error-container text-on-error-container rounded-lg px-4 py-3 text-sm font-body flex items-start gap-3">
              <Icon name="error" size="sm" className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form action={register} className="space-y-6">
            <div className="space-y-1.5">
              <label
                className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                htmlFor="farm_name"
              >
                Farm Name
              </label>
              <input
                className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all duration-300 py-3 px-0 font-body placeholder:text-outline"
                id="farm_name"
                name="farm_name"
                placeholder="e.g. Sunrise Valley Farm"
                required
                type="text"
                autoComplete="organization"
              />
            </div>

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
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all duration-300 py-3 px-0 font-body placeholder:text-outline"
                id="password"
                name="password"
                placeholder="At least 8 characters"
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {/* Info badge */}
            <div className="bg-surface-container-low rounded-lg p-4 flex items-start gap-4">
              <Icon name="mail" className="text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Confirm your email
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  We will send a confirmation link to your email before your
                  listing goes live.
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button
                className="w-full bg-primary text-on-primary font-label font-bold py-4 rounded-xl hover:bg-primary/90 active:scale-95 transition-all duration-200 uppercase tracking-widest text-sm"
                type="submit"
              >
                Create Farm Account
              </button>
              <Link
                href="/farmer/login"
                className="block w-full bg-surface-container-highest text-primary font-label font-bold py-4 rounded-xl hover:bg-surface-variant active:scale-95 transition-all duration-200 uppercase tracking-widest text-sm text-center"
              >
                Already have an account
              </Link>
            </div>
          </form>

          <footer className="mt-16 pt-8 flex flex-col items-center md:items-start gap-6">
            <p className="font-headline italic text-on-surface-variant/40 text-sm">
              &copy; 2024 The Green Market Farm. Cultivated with care.
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
