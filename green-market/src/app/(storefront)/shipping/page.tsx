export default function ShippingPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <span className="text-secondary font-label text-xs uppercase tracking-widest mb-3 block">
        Orders
      </span>
      <h1 className="text-4xl font-headline italic text-tertiary mb-8">Shipping & Pickup Info</h1>

      <div className="prose prose-sm text-on-surface-variant font-body space-y-6">
        <section>
          <h2 className="font-headline text-xl text-tertiary mb-3">Local Pickup</h2>
          <p className="leading-relaxed">
            Most Green Market orders are available for pickup at the Blacksburg Farmers Market or directly from the vendor. Pickup details will be included in your order confirmation email.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-tertiary mb-3">Order Processing</h2>
          <p className="leading-relaxed">
            Orders are confirmed and prepared by each individual vendor. You will receive an email update when your order status changes. Processing times vary by vendor and product availability.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-tertiary mb-3">Freshness Guarantee</h2>
          <p className="leading-relaxed">
            All products are sourced fresh from local farms. If you receive an item that does not meet your expectations, please contact us within 24 hours and we will make it right.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-tertiary mb-3">Questions?</h2>
          <p className="leading-relaxed">
            Reach us through our{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact form
            </a>{" "}
            or email{" "}
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
