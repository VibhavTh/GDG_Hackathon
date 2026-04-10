import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";
import { SalesChart } from "./sales-chart";
import { HarvestCalendar } from "./harvest-calendar";
import { LOW_STOCK_THRESHOLD } from "@/config/site";


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
  await supabase.auth.getUser();

  const service = createServiceClient();

  const { data: site } = await service
    .from("site_settings")
    .select("name, description, location")
    .eq("id", 1)
    .single();

  const profileIncomplete = site && (!site.description || !site.location);

  // Active order count
  const { count: activeOrderCount } = await service
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["placed", "confirmed", "preparing", "ready"]);

  // Total revenue from fulfilled orders
  const { data: revenueRows } = await service
    .from("orders")
    .select("total_amount")
    .eq("status", "fulfilled");
  const totalRevenue = (revenueRows ?? []).reduce(
    (sum, r) => sum + (r.total_amount as number),
    0
  );

  // Weekly chart data (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const { data: weeklyRows } = await service
    .from("orders")
    .select("created_at, total_amount")
    .in("status", ["confirmed", "preparing", "ready", "fulfilled"])
    .gte("created_at", weekAgo.toISOString());

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyTotals: Record<number, number> = {};
  for (const row of weeklyRows ?? []) {
    const day = new Date(row.created_at).getDay();
    dailyTotals[day] = (dailyTotals[day] ?? 0) + (row.total_amount as number);
  }
  const weeklyBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayIndex = d.getDay();
    return {
      label: DAY_LABELS[dayIndex],
      amount: dailyTotals[dayIndex] ?? 0,
      isHighlight: i === 6,
    };
  });

  // Today hourly data in 4-hour buckets
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data: todayRows } = await service
    .from("orders")
    .select("created_at, total_amount")
    .in("status", ["confirmed", "preparing", "ready", "fulfilled"])
    .gte("created_at", todayStart.toISOString());

  const HOUR_BUCKETS = ["12a", "4a", "8a", "12p", "4p", "8p"];
  const hourlyTotals: Record<number, number> = {};
  for (const row of todayRows ?? []) {
    const bucket = Math.floor(new Date(row.created_at).getHours() / 4);
    hourlyTotals[bucket] = (hourlyTotals[bucket] ?? 0) + (row.total_amount as number);
  }
  const currentBucket = Math.floor(new Date().getHours() / 4);
  const dailyBars = HOUR_BUCKETS.map((label, i) => ({
    label,
    amount: hourlyTotals[i] ?? 0,
    isHighlight: i === currentBucket,
  }));

  // Low stock products
  const { data: lowStockProducts } = await service
    .from("products")
    .select("id, name, stock")
    .lte("stock", LOW_STOCK_THRESHOLD)
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("stock", { ascending: true })
    .limit(5);

  // Recent active orders for the table
  const { data: recentOrderRows } = await service
    .from("orders")
    .select("id, guest_email, customer_id, status, total_amount, order_items(id, quantity, products(name))")
    .in("status", ["placed", "confirmed", "preparing", "ready"])
    .order("created_at", { ascending: false })
    .limit(5);

  type RecentRow = {
    id: string;
    guest_email: string | null;
    customer_id: string | null;
    status: OrderStatus;
    total_amount: number;
    order_items: { id: string; quantity: number; products: { name: string } | null }[];
  };

  const recentOrders = ((recentOrderRows ?? []) as unknown as RecentRow[]).map((o) => {
    const items = o.order_items
      .map((i) => i.products?.name)
      .filter((n): n is string => Boolean(n))
      .join(", ");
    const displayName = o.guest_email
      ? o.guest_email.split("@")[0]
      : "Customer";
    const initials = displayName.slice(0, 2).toUpperCase();
    return {
      order_id: o.id,
      initials,
      name: displayName,
      status: o.status,
      items,
      total_amount: o.total_amount,
    };
  });

  return (
    <main className="flex-1 px-10 py-14 w-full">
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
            href="/settings"
            className="shrink-0 text-xs font-label font-bold uppercase tracking-wider text-primary hover:underline"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
        <div>
          <h2 className="text-4xl font-headline italic text-tertiary leading-tight">
            {site?.name ? `Welcome, ${site.name}.` : "Good morning."}
          </h2>
          <p className="text-on-surface-variant font-body mt-2">
            Your listings are live and orders are coming in.
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 stagger-children">
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

        {/* Orders real count */}
        <div className="bg-surface-container-highest p-8 rounded-xl animate-slide-up-fast">
          <p className="text-sm font-label text-on-surface-variant mb-4 uppercase tracking-wider">
            Active Orders
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

        {/* Stock Alerts */}
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

      {/* Chart + Calendar */}
      <div className="flex flex-col md:flex-row gap-6 mb-16 items-stretch">
        <div className="flex-[3] min-w-0">
          <SalesChart weeklyBars={weeklyBars} dailyBars={dailyBars} />
        </div>
        <div className="flex-[1] min-w-0">
          <HarvestCalendar />
        </div>
      </div>

      {/* Active Orders */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="px-6 md:px-8 py-6 flex justify-between items-center">
          <h4 className="font-headline italic text-2xl text-tertiary">
            Active Orders
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
                    {formatCents(order.total_amount)}
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
                      Items
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
                        {formatCents(order.total_amount)}
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
