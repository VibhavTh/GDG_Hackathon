import { Suspense } from "react";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/icon";

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function pct(value: number, max: number) {
  if (max === 0) return 0;
  return Math.round((value / max) * 100);
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 px-6 md:px-10 py-12 max-w-5xl">
        <p className="text-on-surface-variant font-body animate-pulse">Loading analytics...</p>
      </main>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}

async function AnalyticsContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const service = createServiceClient();

  // --- Date boundaries ---
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  // --- Revenue: this week vs last week ---
  const [{ data: thisWeekRows }, { data: lastWeekRows }] = await Promise.all([
    service
      .from("orders")
      .select("total_amount")
      .in("status", ["confirmed", "preparing", "ready", "fulfilled"])
      .gte("created_at", startOfThisWeek.toISOString()),
    service
      .from("orders")
      .select("total_amount")
      .in("status", ["confirmed", "preparing", "ready", "fulfilled"])
      .gte("created_at", startOfLastWeek.toISOString())
      .lt("created_at", startOfThisWeek.toISOString()),
  ]);

  const thisWeekRevenue = (thisWeekRows ?? []).reduce((s, r) => s + (r.total_amount as number), 0);
  const lastWeekRevenue = (lastWeekRows ?? []).reduce((s, r) => s + (r.total_amount as number), 0);
  const revenueDelta = thisWeekRevenue - lastWeekRevenue;
  const revenueUpDown = revenueDelta >= 0 ? "up" : "down";

  // --- Top products by revenue from order_items ---
  const { data: itemRows } = await service
    .from("order_items")
    .select("quantity, unit_price, product_id, products(name)");

  type ItemRow = {
    quantity: number;
    unit_price: number;
    product_id: string;
    products: { name: string } | null;
  };

  const productMap = new Map<string, { name: string; revenue: number; units: number }>();
  for (const row of (itemRows ?? []) as unknown as ItemRow[]) {
    const id = row.product_id;
    const name = row.products?.name ?? "Unknown";
    const rev = row.quantity * row.unit_price;
    const existing = productMap.get(id);
    if (existing) {
      existing.revenue += rev;
      existing.units += row.quantity;
    } else {
      productMap.set(id, { name, revenue: rev, units: row.quantity });
    }
  }

  const topProducts = [...productMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const maxProductRevenue = topProducts[0]?.revenue ?? 1;

  // --- Orders by day of week (all-time) ---
  const { data: allOrders } = await service
    .from("orders")
    .select("created_at")
    .in("status", ["confirmed", "preparing", "ready", "fulfilled"]);

  const dayBuckets: number[] = Array(7).fill(0);
  for (const o of allOrders ?? []) {
    dayBuckets[new Date(o.created_at).getDay()]++;
  }
  const maxDayCount = Math.max(...dayBuckets, 1);

  // --- Order counts by status ---
  const statusCounts: Record<string, number> = {};
  for (const o of allOrders ?? []) {
    // We only have confirmed+ from above, so do a separate query for all statuses
    void o;
  }
  const { data: allStatusRows } = await service
    .from("orders")
    .select("status");

  for (const o of allStatusRows ?? []) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  }

  const totalOrders = (allStatusRows ?? []).length;

  return (
    <main className="flex-1 px-6 md:px-10 py-12 max-w-5xl">
      {/* Header */}
      <header className="mb-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-label uppercase tracking-wider text-on-surface-variant/60 hover:text-primary transition-colors mb-6"
        >
          <Icon name="arrow_back" size="sm" />
          Back to Overview
        </Link>
        <h1 className="text-4xl font-headline italic text-tertiary">Analytics</h1>
        <p className="text-on-surface-variant font-body mt-1">Revenue, top products, and order patterns.</p>
      </header>

      {/* Revenue comparison */}
      <section className="mb-12">
        <h2 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-6">
          Weekly Revenue
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface-container-low rounded-xl p-6">
            <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-3">This Week</p>
            <p className="text-3xl font-headline italic text-tertiary">{formatCents(thisWeekRevenue)}</p>
            <p className="text-xs text-on-surface-variant mt-2">{thisWeekRows?.length ?? 0} orders</p>
          </div>

          <div className="bg-surface-container-low rounded-xl p-6">
            <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-3">Last Week</p>
            <p className="text-3xl font-headline italic text-tertiary">{formatCents(lastWeekRevenue)}</p>
            <p className="text-xs text-on-surface-variant mt-2">{lastWeekRows?.length ?? 0} orders</p>
          </div>

          <div className={`rounded-xl p-6 ${revenueUpDown === "up" ? "bg-primary/10" : "bg-secondary/10"}`}>
            <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-3">Change</p>
            <div className="flex items-center gap-2">
              <Icon
                name={revenueUpDown === "up" ? "trending_up" : "trending_down"}
                className={revenueUpDown === "up" ? "text-primary" : "text-secondary"}
              />
              <p className={`text-3xl font-headline italic ${revenueUpDown === "up" ? "text-primary" : "text-secondary"}`}>
                {formatCents(Math.abs(revenueDelta))}
              </p>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              {revenueUpDown === "up" ? "More than last week" : "Less than last week"}
            </p>
          </div>
        </div>
      </section>

      {/* Top products */}
      <section className="mb-12">
        <h2 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-6">
          Top Products
        </h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-on-surface-variant italic">No order data yet.</p>
        ) : (
          <div className="bg-surface-container-low rounded-xl overflow-hidden">
            {topProducts.map((product, i) => (
              <div
                key={product.name}
                className={`px-6 py-4 flex items-center gap-4 ${i % 2 === 1 ? "bg-surface-container/40" : ""}`}
              >
                <span className="text-xs font-bold text-on-surface-variant w-5 shrink-0 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-tertiary truncate">{product.name}</p>
                  <div className="mt-1.5 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${pct(product.revenue, maxProductRevenue)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{formatCents(product.revenue)}</p>
                  <p className="text-[10px] text-on-surface-variant">{product.units} units</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Orders by day of week */}
      <section className="mb-12">
        <h2 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-6">
          Busiest Order Days
        </h2>
        <div className="bg-surface-container-low rounded-xl p-6">
          <div className="flex items-end gap-3 h-32">
            {dayBuckets.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-on-surface-variant">{count > 0 ? count : ""}</span>
                <div className="w-full flex flex-col justify-end" style={{ height: "80px" }}>
                  <div
                    className={`w-full rounded-t transition-all duration-700 ${
                      count === Math.max(...dayBuckets) && count > 0
                        ? "bg-primary"
                        : "bg-surface-container-highest"
                    }`}
                    style={{ height: `${pct(count, maxDayCount)}%`, minHeight: count > 0 ? "4px" : "0" }}
                  />
                </div>
                <span className="text-[10px] font-label text-on-surface-variant">{DAY_NAMES[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Orders by status */}
      <section>
        <h2 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-6">
          All-Time Orders by Status
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { status: "fulfilled", label: "Fulfilled", icon: "check_circle", color: "text-primary" },
            { status: "placed", label: "Placed", icon: "shopping_bag", color: "text-on-surface-variant" },
            { status: "confirmed", label: "Confirmed", icon: "thumb_up", color: "text-primary" },
            { status: "preparing", label: "Preparing", icon: "cooking", color: "text-primary" },
            { status: "ready", label: "Ready", icon: "local_shipping", color: "text-secondary" },
            { status: "cancelled", label: "Cancelled", icon: "cancel", color: "text-error" },
          ].map(({ status, label, icon, color }) => (
            <div key={status} className="bg-surface-container-low rounded-xl p-5 flex items-center gap-3">
              <Icon name={icon} className={color} />
              <div>
                <p className="text-xl font-headline italic text-tertiary">{statusCounts[status] ?? 0}</p>
                <p className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant">{label}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-on-surface-variant text-right">
          {totalOrders} total orders all-time
        </p>
      </section>
    </main>
  );
}
