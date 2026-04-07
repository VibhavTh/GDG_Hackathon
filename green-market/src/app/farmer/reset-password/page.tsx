import { Icon } from "@/components/ui/icon";
import { resetPassword } from "./actions";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="font-headline italic text-4xl text-tertiary mb-3">
          Set a new password
        </h1>
        <p className="text-on-surface-variant font-body mb-10">
          Choose a strong password for your farm account.
        </p>

        {error && (
          <div className="mb-6 bg-error-container text-on-error-container rounded-lg px-4 py-3 text-sm font-body flex items-start gap-3">
            <Icon name="error" size="sm" className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form action={resetPassword} className="space-y-6">
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all duration-300 py-3 px-0 font-body placeholder:text-outline"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirm_password"
              className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              Confirm Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all duration-300 py-3 px-0 font-body placeholder:text-outline"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-on-primary font-label font-bold py-4 rounded-xl hover:bg-primary/90 active:scale-95 transition-all duration-200 uppercase tracking-widest text-sm"
          >
            Update Password
          </button>
        </form>
      </div>
    </main>
  );
}
