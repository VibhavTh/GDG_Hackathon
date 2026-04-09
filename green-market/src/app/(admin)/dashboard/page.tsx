import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";


const STATUS_STYLE: Partial<Record<OrderStatus, string>> = {
  placed: "bg-surface-container-highest text-on-surface-variant",
  confirmed: "bg-primary/10 text-primary",
  preparing: "bg-primary/10 text-primary",
  ready: "bg-secondary-container/20 text-on-secondary-container",
  fulfilled: "bg-surface-container text-on-surface-variant",
};

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const service = createServiceClient();
  const { data: farm } = user
    ? await service
        .from("farms")
        .select("id, name, description, location")
        .eq("owner_id", user.id)
        .single()
    : {
        data: null as {
          id: string;
          name: string;
          description: string | null;
          location: string | null;
        } | null,
      };

  const profileIncomplete = farm && (!farm.description || !farm.location);

  // Active order count
  const { count: activeOrderCount } = farm
    ? await service
        .from("farm_order_summary")
        .select("*", { count: "exact", head: true })
        .eq("farm_id", farm.id)
        .in("status", ["placed", "confirmed", "preparing", "ready"])
    : { count: 0 };

  // Total revenue from fulfilled orders
  const { data: revenueRows } = farm
    ? await service
        .from("farm_order_summary")
        .select("farm_subtotal")
        .eq("farm_id", farm.id)
        .eq("status", "fulfilled")
    : { data: [] };
  const totalRevenue = (revenueRows ?? []).reduce(
    (sum, r) => sum + (r.farm_subtotal as number),
    0
  );

  // Weekly chart data (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const { data: weeklyRows } = farm
    ? await service
        .from("farm_order_summary")
        .select("order_date, farm_subtotal")
        .eq("farm_id", farm.id)
        .in("status", ["confirmed", "preparing", "ready", "fulfilled"])
        .gte("order_date", weekAgo.toISOString())
    : { data: [] };

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyTotals: Record<number, number> = {};
  for (const row of weeklyRows ?? []) {
    const day = new Date(row.order_date).getDay();
    dailyTotals[day] = (dailyTotals[day] ?? 0) + (row.farm_subtotal as number);
  }
  const chartBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayIndex = d.getDay();
    return {
      day: DAY_LABELS[dayIndex],
      amount: dailyTotals[dayIndex] ?? 0,
      isToday: i === 6,
    };
  });
  const maxBarAmount = Math.max(...chartBars.map((b) => b.amount), 1);

  // Low stock products
  const { data: lowStockProducts } = farm
    ? await service
        .from("products")
        .select("id, name, stock")
        .eq("farm_id", farm.id)
        .lte("stock", 5)
        .is("deleted_at", null)
        .eq("is_active", true)
        .order("stock", { ascending: true })
        .limit(5)
    : { data: [] as { id: string; name: string; stock: number }[] };

  // Recent active orders for the table
  const { data: recentSummaries } = farm
    ? await service
        .from("farm_order_summary")
        .select("order_id, guest_email, customer_id, status, farm_subtotal, items")
        .eq("farm_id", farm.id)
        .in("status", ["placed", "confirmed", "preparing", "ready"])
        .order("order_date", { ascending: false })
        .limit(5)
    : { data: [] };

  const recentOrders = (recentSummaries ?? []).map((s) => {
    const items = Array.isArray(s.items)
      ? (s.items as { name: string }[]).map((i) => i.name).join(", ")
      : "";
    const displayName = s.guest_email
      ? s.guest_email.split("@")[0]
      : "Customer";
    const initials = displayName.slice(0, 2).toUpperCase();
    return {
      order_id: s.order_id,
      initials,
      name: displayName,
      status: s.status as OrderStatus,
      items,
      farm_subtotal: s.farm_subtotal,
    };
  });

  return (
    <main className="flex-1 px-8 py-10 max-w-7xl">
      {/* No-farm setup banner */}
      {!farm && (
        <div className="mb-8 bg-primary/8 rounded-xl px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Icon name="storefront" className="text-primary" size="sm" />
            </div>
            <div>
              <p className="text-sm font-semibold font-body text-on-surface">
                You haven&apos;t set up your farm yet.
              </p>
              <p className="text-xs text-on-surface-variant font-body mt-0.5">
                Create your farm profile to start listing products and reaching customers.
              </p>
            </div>
          </div>
          <Link
            href="/farmer/setup"
            className="shrink-0 bg-primary text-on-primary font-label font-bold py-2.5 px-6 rounded-lg hover:bg-primary/90 active:scale-95 transition-all duration-200 uppercase tracking-widest text-xs"
          >
            Create Your Farm
          </Link>
        </div>
      )}

      {/* Incomplete profile banner */}
      {profileIncomplete && (
        <div className="mb-8 bg-secondary-fixed/30 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon name="edit_note" className="text-secondary shrink-0" />
            <p className="text-sm font-body text-on-surface">
              <span className="font-semibold">Your farm profile is incomplete.</span>{" "}
              Add a description and location so customers can find you.
            </p>
          </div>
          <Link
            href="/farmer/setup"
            className="shrink-0 text-xs font-label font-bold uppercase tracking-wider text-primary hover:underline"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-headline italic text-tertiary leading-tight">
            {farm?.name ? `Welcome, ${farm.name}.` : "Good morning, Farmer."}
          </h2>
          <p className="text-on-surface-variant font-body mt-2">
            {farm ? "Your listings are live and orders are coming in." : "Set up your farm to get started."}
          </p>
        </div>
        <div className="bg-surface-container-low px-4 py-2 rounded-lg flex items-center gap-2">
          <Icon name="calendar_today" className="text-secondary" size="sm" />
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 stagger-children">
        {/* Revenue */}
        <div className="bg-surface-container-low p-8 rounded-xl group animate-slide-up-fast">
          <p className="text-sm font-label text-on-surface-variant mb-4 uppercase tracking-wider">
            Total Revenue
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-4xl font-headline italic ${totalRevenue > 0 ? "text-tertiary" : "text-on-surface-variant/40"}`}>
              {(totalRevenue / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-4">
            {totalRevenue > 0 ? "From fulfilled orders" : "No fulfilled orders yet"}
          </p>
        </div>

        {/* Orders — real count */}
        <div className="bg-surface-container-highest p-8 rounded-xl animate-slide-up-fast">
          <p className="text-sm font-label text-on-surface-variant mb-4 uppercase tracking-wider">
            Harvest Orders
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-headline italic text-tertiary">
              {activeOrderCount ?? 0}
            </h3>
            <span className="text-xs text-secondary font-medium">
              Pending Fulfillment
            </span>
          </div>
          <div className="mt-6 flex -space-x-2">
            {[
              "bg-surface-container-high",
              "bg-surface-container-highest",
              "bg-surface-variant",
            ].map((bg, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 border-surface-container-highest ${bg}`}
              />
            ))}
          </div>
        </div>

        {/* Stock Alerts — real data */}
        <div className="bg-surface-container-low p-8 rounded-xl animate-slide-up-fast">
          <p className="text-sm font-label text-on-surface-variant mb-4 uppercase tracking-wider">
            Stock Alerts
          </p>
          {(lowStockProducts ?? []).length === 0 ? (
            <p className="text-sm text-on-surface-variant italic">
              All products well stocked.
            </p>
          ) : (
            <div className="space-y-3">
              {(lowStockProducts ?? []).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                    {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-12">
        {/* Sales Chart */}
        <div className="bg-surface-container-low p-8 rounded-xl h-80 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-headline italic text-xl text-tertiary">
              Sales Performance
            </h4>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1 bg-surface-container rounded-full text-on-surface-variant">
                Daily
              </button>
              <button className="text-xs px-3 py-1 bg-primary text-on-primary rounded-full">
                Weekly
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-4 px-4 pb-4">
            {chartBars.map((bar, i) => {
              const heightPct = `${Math.max(4, Math.round((bar.amount / maxBarAmount) * 100))}%`;
              return (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-label text-on-surface-variant/60">
                    {bar.amount > 0 ? `$${(bar.amount / 100).toFixed(0)}` : ""}
                  </span>
                  <div
                    className={`w-full rounded-t-lg animate-grow-bar ${bar.isToday ? "bg-primary" : "bg-primary/20"}`}
                    style={{ height: heightPct, animationDelay: `${i * 60}ms` }}
                    title={`${bar.day}: $${(bar.amount / 100).toFixed(2)}`}
                  />
                  <span className="text-[10px] font-label text-on-surface-variant">{bar.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Orders */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden mb-12">
        <div className="px-6 md:px-8 py-6 flex justify-between items-center">
          <h4 className="font-headline italic text-2xl text-tertiary">
            Active Harvest Orders
          </h4>
          <Link
            href="/orders"
            className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
          >
            View All <Icon name="arrow_forward" size="sm" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-8 py-10 text-center text-on-surface-variant text-sm italic">
            No active orders right now.
          </div>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="md:hidden divide-y divide-surface-container">
              {recentOrders.map((order) => (
                <div key={order.order_id} className="px-6 py-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-tertiary text-sm">
                        {order.initials}
                      </div>
                      <p className="text-sm font-bold leading-tight">{order.name}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${STATUS_STYLE[order.status] ?? ""}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-1">
                    {order.items}
                  </p>
                  <p className="text-right font-bold text-tertiary text-sm">
                    {formatCents(order.farm_subtotal)}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop: full table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container/50">
                    <th scope="col" className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant text-left">
                      Customer
                    </th>
                    <th scope="col" className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant text-left">
                      Harvest Items
                    </th>
                    <th scope="col" className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant text-left">
                      Status
                    </th>
                    <th scope="col" className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr
                      key={order.order_id}
                      className={`hover:bg-surface-container-high/50 transition-colors duration-150 ${
                        i % 2 === 1 ? "bg-surface-container-low/50" : ""
                      }`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-tertiary">
                            {order.initials}
                          </div>
                          <p className="text-sm font-bold">{order.name}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-on-surface-variant max-w-[240px]">
                        <span className="line-clamp-2">{order.items}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${STATUS_STYLE[order.status] ?? ""}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-tertiary">
                        {formatCents(order.farm_subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
