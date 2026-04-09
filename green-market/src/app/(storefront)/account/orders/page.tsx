import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/icon";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting Payment",
  placed: "Order Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  fulfilled: "Delivered",
  cancelled: "Cancelled",
  failed: "Payment Failed",
  abandoned: "Abandoned",
};

const STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-surface-container-highest text-on-surface-variant",
  placed: "bg-surface-container-highest text-on-surface",
  confirmed: "bg-primary/10 text-primary",
  preparing: "bg-primary/10 text-primary",
  ready: "bg-secondary-fixed text-on-secondary-fixed",
  fulfilled: "bg-primary-fixed text-primary",
  cancelled: "bg-error/10 text-error",
  failed: "bg-error/10 text-error",
  abandoned: "bg-surface-container-highest text-on-surface-variant",
};

export default async function OrderHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/customer/login?next=/account/orders");
  }

  const service = createServiceClient();

  // Fetch by customer_id (logged-in orders) OR by guest_email (orders placed before login)
  const { data: orders } = await service
    .from("orders")
    .select(`
      id,
      status,
      total_amount,
      created_at,
      special_instructions,
      order_items (
        id,
        quantity,
        unit_price,
        products (
          id,
          name,
          image_url
        )
      )
    `)
    .or(`customer_id.eq.${user.id},guest_email.eq.${user.email}`)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10 animate-slide-up">
        <span className="text-secondary font-label text-xs uppercase tracking-widest mb-2 block">
          Your Account
        </span>
        <h1 className="text-4xl font-headline italic text-tertiary">
          Order History
        </h1>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-6 stagger-children">
          {orders.map((order, i) => {
            const items = order.order_items ?? [];
            const firstItem = items[0];
            const firstProduct = firstItem?.products
              ? (firstItem.products as unknown as { id: string; name: string; image_url: string | null })
              : null;
            const extraCount = items.length - 1;

            return (
              <div
                key={order.id}
                className="bg-surface-container-low rounded-2xl p-6 space-y-4 animate-slide-up-fast hover-lift transition-transform"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest mb-1">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-on-surface-variant font-body">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors duration-200 ${
                      STATUS_STYLES[order.status] ?? STATUS_STYLES.placed
                    }`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>

                {/* Items summary */}
                <div className="flex items-center gap-3">
                  {firstProduct && (
                    <div className="w-12 h-12 rounded-lg bg-surface-container-highest overflow-hidden shrink-0 relative">
                      {firstProduct.image_url ? (
                        <Image
                          src={firstProduct.image_url}
                          alt={firstProduct.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline-variant">
                          <Icon name="image" size="sm" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {firstProduct?.name ?? "Order item"}
                      {extraCount > 0 && (
                        <span className="text-on-surface-variant ml-1">
                          +{extraCount} more
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="font-headline text-primary text-lg shrink-0">
                    ${(order.total_amount / 100).toFixed(2)}
                  </p>
                </div>

                {order.special_instructions && (
                  <div className="bg-surface-container rounded-lg px-4 py-3 text-xs text-on-surface-variant font-body flex items-start gap-2">
                    <Icon name="note" size="sm" className="shrink-0 mt-0.5" />
                    <span>{order.special_instructions}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-6 animate-float">
            <Icon name="receipt_long" className="text-on-surface-variant text-4xl" />
          </div>
          <h3 className="font-headline italic text-2xl text-tertiary mb-2">
            No orders yet
          </h3>
          <p className="text-on-surface-variant font-body mb-8">
            When you place an order, it&rsquo;ll show up here.
          </p>
          <Link
            href="/products"
            className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-[0.97] transition-all duration-150 inline-flex items-center gap-2"
          >
            Start Shopping
            <Icon name="arrow_forward" size="sm" />
          </Link>
        </div>
      )}
    </div>
  );
}
