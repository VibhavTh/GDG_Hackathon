import { Suspense } from "react";
import { Icon } from "@/components/ui/icon";
import { SubmitButton } from "@/components/ui/submit-button";
import { submitContact } from "./actions";

interface Props {
  searchParams: Promise<{ sent?: string; error?: string }>;
}

export default function ContactPage({ searchParams }: Props) {
  return (
    <Suspense fallback={null}>
      <ContactPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ContactPageContent({ searchParams }: Props) {
  const { sent, error } = await searchParams;

  return (
    <div className="min-h-screen bg-surface pt-28 pb-20 px-4">
      <div className="max-w-xl mx-auto animate-slide-up">
        <div className="text-center mb-10">
          <h1 className="font-headline italic text-4xl text-tertiary mb-3">Get in touch</h1>
          <p className="text-on-surface-variant font-body">
            Questions, feedback, or just want to say hello? We read every message.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-8 space-y-6">
          {sent && (
            <div className="bg-primary/10 text-primary text-sm px-4 py-3 rounded-lg font-body flex items-center gap-2">
              <Icon name="check_circle" size="sm" />
              <span>Message sent! We will get back to you soon.</span>
            </div>
          )}
          {error && (
            <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg font-body flex items-start gap-2">
              <Icon name="error" size="sm" className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!sent && (
            <form action={submitContact} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    Your Name
                  </label>
                  <input
                    id="name" name="name" type="text"
                    placeholder="Jane Smith"
                    className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    Email *
                  </label>
                  <input
                    id="email" name="email" type="email" required
                    placeholder="you@example.com"
                    className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Subject *
                </label>
                <input
                  id="subject" name="subject" type="text" required
                  placeholder="What is this about?"
                  className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Message *
                </label>
                <textarea
                  id="message" name="message" rows={5} required
                  placeholder="Tell us how we can help..."
                  className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all resize-none"
                />
              </div>
              <SubmitButton label="Send Message" loadingLabel="Sending..." />
            </form>
          )}

          <div className="pt-4 border-t border-outline-variant/30 flex items-center gap-3 text-xs text-on-surface-variant">
            <Icon name="mail" size="sm" className="text-primary shrink-0" />
            <span>Or email us directly at <a href="mailto:greenmarketfarms1@gmail.com" className="text-primary hover:underline font-bold">greenmarketfarms1@gmail.com</a></span>
          </div>
        </div>
      </div>
    </div>
  );
}
