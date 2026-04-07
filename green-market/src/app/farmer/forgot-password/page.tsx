import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { requestPasswordReset } from "./actions";

interface Props {
  searchParams: Promise<{ sent?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { sent } = await searchParams;

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          href="/farmer/login"
          className="inline-flex items-center gap-2 text-xs font-label uppercase tracking-wider text-on-surface-variant/60 hover:text-primary transition-colors mb-10"
        >
          <Icon name="arrow_back" size="sm" />
          Back to login
        </Link>

        {sent ? (
          <>
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-8">
              <Icon name="mark_email_read" className="text-on-primary-container text-3xl" />
            </div>
            <h1 className="font-headline italic text-4xl text-tertiary mb-4">
              Check your inbox
            </h1>
            <p className="text-on-surface-variant font-body text-lg leading-relaxed">
              If an account exists for that email, we sent a password reset
              link. It expires in 1 hour.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-headline italic text-4xl text-tertiary mb-3">
              Reset your password
            </h1>
            <p className="text-on-surface-variant font-body mb-10">
              Enter your account email and we will send you a reset link.
            </p>

            <form action={requestPasswordReset} className="space-y-6">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="farmer@greenmarket.farm"
                  className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all duration-300 py-3 px-0 font-body placeholder:text-outline"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-on-primary font-label font-bold py-4 rounded-xl hover:bg-primary/90 active:scale-95 transition-all duration-200 uppercase tracking-widest text-sm"
              >
                Send Reset Link
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
