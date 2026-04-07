import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-8">
          <Icon name="mark_email_unread" className="text-on-primary-container text-4xl" />
        </div>
        <h1 className="font-headline italic text-4xl text-tertiary mb-4">
          Check your inbox
        </h1>
        <p className="text-on-surface-variant font-body text-lg leading-relaxed mb-10">
          We sent a confirmation link to your email address. Click it to verify
          your account and access your farm dashboard.
        </p>
        <div className="bg-surface-container-low rounded-xl p-6 text-left space-y-3 mb-10">
          <p className="text-sm font-semibold text-on-surface font-label uppercase tracking-wider">
            Did not receive it?
          </p>
          <p className="text-sm text-on-surface-variant font-body">
            Check your spam folder. If it is still not there, try registering
            again or contact support.
          </p>
        </div>
        <Link
          href="/farmer/login"
          className="font-label text-sm font-bold text-primary uppercase tracking-widest hover:underline"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
