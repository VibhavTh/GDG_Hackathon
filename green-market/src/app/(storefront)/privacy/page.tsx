export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <span className="text-secondary font-label text-xs uppercase tracking-widest mb-3 block">
        Legal
      </span>
      <h1 className="text-4xl font-headline italic text-tertiary mb-8">Privacy Policy</h1>

      <div className="prose prose-sm text-on-surface-variant font-body space-y-6">
        <section>
          <h2 className="font-headline text-xl text-tertiary mb-3">Information We Collect</h2>
          <p className="leading-relaxed">
            When you place an order or create an account, we collect your email address and order details. We use this information solely to process your orders and send you relevant updates.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-tertiary mb-3">How We Use Your Information</h2>
          <p className="leading-relaxed">
            Your information is used to fulfill orders, communicate order status, and (if subscribed) send The Weekly Harvest newsletter. We do not sell or share your data with third parties.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-tertiary mb-3">Newsletter</h2>
          <p className="leading-relaxed">
            If you subscribe to The Weekly Harvest, you can unsubscribe at any time by replying to any newsletter email. We will remove you from the list within 48 hours.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-tertiary mb-3">Contact</h2>
          <p className="leading-relaxed">
            Questions about your data? Email us at{" "}
            <a href="mailto:greenmarketfarms1@gmail.com" className="text-primary hover:underline">
              greenmarketfarms1@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
