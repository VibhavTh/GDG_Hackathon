import { Suspense } from "react";
import { createServiceClient } from "@/lib/supabase/server";
import { sendNewsletter } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { NewsletterHistory } from "./newsletter-history";

export default function AdminNewsletterPage() {
  return (
    <Suspense fallback={null}>
      <AdminNewsletterContent />
    </Suspense>
  );
}

async function AdminNewsletterContent() {
  const service = createServiceClient();

  const [{ data: newsletters }, { count: subscriberCount }] = await Promise.all([
    service
      .from("newsletters")
      .select("id, subject, body_html, sent_at, recipient_count")
      .order("created_at", { ascending: false })
      .limit(10),
    service
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .is("unsubscribed_at", null),
  ]);

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <header className="mb-10">
        <h1 className="font-headline italic text-4xl text-tertiary mb-1">The Weekly Harvest</h1>
        <p className="text-secondary font-label text-xs uppercase tracking-widest mb-2">Newsletter</p>
        <p className="text-on-surface-variant text-sm">
          {subscriberCount ?? 0} active subscriber{subscriberCount !== 1 ? "s" : ""}
        </p>
      </header>

      {/* Compose */}
      <section className="mb-12 bg-surface-container-low rounded-2xl p-8">
        <h2 className="font-headline text-xl text-tertiary font-bold mb-6">Compose Newsletter</h2>
        <form action={sendNewsletter} className="space-y-5">
          <div>
            <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Subject Line *
            </label>
            <input
              name="subject"
              required
              placeholder="e.g. The Weekly Harvest, April Edition"
              className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Message *
            </label>
            <textarea
              name="body"
              required
              rows={10}
              placeholder="Write your newsletter content here."
              className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all resize-none"
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-on-surface-variant">
              Will be sent to <strong>{subscriberCount ?? 0} subscribers</strong>
            </p>
            <SubmitButton label="Send Newsletter" loadingLabel="Sending..." />
          </div>
        </form>
      </section>

      {/* History */}
      <section>
        <h2 className="font-label text-xs uppercase tracking-widest text-secondary font-bold mb-4">
          Sent History
        </h2>
        <NewsletterHistory newsletters={newsletters ?? []} />
      </section>
    </div>
  );
}
