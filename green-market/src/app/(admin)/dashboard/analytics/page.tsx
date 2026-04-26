import { Suspense } from "react";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { AnalyticsFilterBar } from "./filter-bar";

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function pct(value: number, max: number) {
  if (max === 0) return 0;
  return Math.round((value / max) * 100);
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_NAMES_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CATEGORY_LABELS: Record<string, string> = {
  vegetables: "Vegetables",
  fruits: "Fruits",
  produce: "Produce",
  baked_goods: "Baked Goods",
  dairy: "Dairy",
  eggs: "Eggs",
  meat: "Meat",
  honey_beeswax: "Honey & Beeswax",
  flowers: "Annual Flowers",
  plants: "Perennial Flowers",
  handmade_crafts: "Handmade Crafts",
  value_added: "Jams & Preserves",
  mushrooms: "Mushrooms",
  other: "Other",
};

const SEASONS: Record<string, { label: string; months: number[] }> = {
  spring: { label: "Spring", months: [2, 3, 4] },
  summer: { label: "Summer", months: [5, 6, 7] },
  fall: { label: "Fall", months: [8, 9, 10] },
  winter: { label: "Winter", months: [11, 0, 1] },
};

interface Props {
  searchParams: Promise<{ period?: string; category?: string; month?: string; season?: string; product_id?: string }>;
}

export default function AnalyticsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={
      <main className="flex-1 px-6 md:px-10 py-12 max-w-5xl">
        <p className="text-on-surface-variant font-body animate-pulse">Loading analytics...</p>
      </main>
    }>
      <AnalyticsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AnalyticsContent({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const service = createServiceClient();
  const { period = "week", category, month, season, product_id } = await searchParams;

  // --- Date boundaries based on period/month/season filter ---
  const now = new Date();

  // Default: this week
  const defaultStart = new Date(now);
  defaultStart.setDate(now.getDate() - now.getDay());
  defaultStart.setHours(0, 0, 0, 0);

  let rangeStart: Date = defaultStart;
  let rangeEnd: Date = now;
  let rangeLabel = "This Week";

  if (month !== undefined) {
    const m = parseInt(month, 10);
    if (m >= 0 && m <= 11) {
      const year = now.getMonth() < m ? now.getFullYear() - 1 : now.getFullYear();
      rangeStart = new Date(year, m, 1);
      rangeEnd = new Date(year, m + 1, 0, 23, 59, 59);
      rangeLabel = MONTH_NAMES_FULL[m];
    }
  } else if (season && SEASONS[season]) {
    const s = SEASONS[season];
    const currentMonth = now.getMonth();
    const inSeason = s.months.includes(currentMonth);
    const year = now.getFullYear();
    const firstM = s.months[0];
    const lastM = s.months[s.months.length - 1];
    rangeStart = new Date(inSeason ? year : year - 1, firstM, 1);
    rangeEnd = new Date(inSeason ? year : year - 1, lastM + 1, 0, 23, 59, 59);
    rangeLabel = s.label;
  } else if (period === "month") {
    rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
    rangeEnd = now;
    rangeLabel = "This Month";
  } else if (period === "year") {
    rangeStart = new Date(now.getFullYear(), 0, 1);
    rangeEnd = now;
    rangeLabel = "This Year";
  }

  // Previous period for comparison
  const rangeDuration = rangeEnd.getTime() - rangeStart.getTime();
  const prevStart = new Date(rangeStart.getTime() - rangeDuration);
  const prevEnd = rangeStart;

  // --- Revenue queries ---
  let currentQ = service
    .from("orders")
    .select("total_amount")
    .in("status", ["confirmed", "preparing", "ready", "fulfilled"])
    .gte("created_at", rangeStart.toISOString())
    .lte("created_at", rangeEnd.toISOString());

  let prevQ = service
    .from("orders")
    .select("total_amount")
    .in("status", ["confirmed", "preparing", "ready", "fulfilled"])
    .gte("created_at", prevStart.toISOString())
    .lt("created_at", prevEnd.toISOString());

  const [{ data: currentRows }, { data: prevRows }] = await Promise.all([currentQ, prevQ]);

  const currentRevenue = (currentRows ?? []).reduce((s, r) => s + (r.total_amount as number), 0);
  const prevRevenue = (prevRows ?? []).reduce((s, r) => s + (r.total_amount as number), 0);
  const revenueDelta = currentRevenue - prevRevenue;
  const revenueUpDown = revenueDelta >= 0 ? "up" : "down";

  // --- Top products by revenue from order_items ---
  type ItemRow = {
    quantity: number;
    unit_price: number;
    product_id: string;
    products: { name: string; category: string } | null;
  };

  let itemQuery = service
    .from("order_items")
    .select("quantity, unit_price, product_id, products(name, category)");

  if (product_id) itemQuery = (itemQuery as typeof itemQuery).eq("product_id", product_id);

  const { data: itemRows } = await itemQuery;

  const productMap = new Map<string, { name: string; category: string; revenue: number; units: number }>();
  for (const row of (itemRows ?? []) as unknown as ItemRow[]) {
    const id = row.product_id;
    const name = row.products?.name ?? "Unknown";
    const cat = row.products?.category ?? "other";
    if (category && cat !== category) continue;
    const rev = row.quantity * row.unit_price;
    const existing = productMap.get(id);
    if (existing) {
      existing.revenue += rev;
      existing.units += row.quantity;
    } else {
      productMap.set(id, { name, category: cat, revenue: rev, units: row.quantity });
    }
  }

  const topProducts = [...productMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const maxProductRevenue = topProducts[0]?.revenue ?? 1;

  // --- Monthly revenue trend (last 6 months) ---
  const { data: monthlyOrders } = await service
    .from("orders")
    .select("total_amount, created_at")
    .in("status", ["confirmed", "preparing", "ready", "fulfilled"])
    .gte("created_at", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString());

  const monthBuckets: number[] = Array(6).fill(0);
  const monthLabels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(MONTH_NAMES_SHORT[d.getMonth()]);
  }
  for (const o of monthlyOrders ?? []) {
    const d = new Date(o.created_at);
    const monthDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (monthDiff >= 0 && monthDiff < 6) {
      monthBuckets[5 - monthDiff] += o.total_amount as number;
    }
  }
  const maxMonthRevenue = Math.max(...monthBuckets, 1);

  // --- Orders by day of week (all-time) ---
  const { data: allOrders } = await service
    .from("orders")
    .select("created_at")
    .eq("status", "fulfilled");

  const dayBuckets: number[] = Array(7).fill(0);
  for (const o of allOrders ?? []) {
    dayBuckets[new Date(o.created_at).getDay()]++;
  }
  const maxDayCount = Math.max(...dayBuckets, 1);

  // --- Order counts by status ---
  const { data: allStatusRows } = await service.from("orders").select("status");
  const statusCounts: Record<string, number> = {};
  for (const o of allStatusRows ?? []) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  }
  const totalOrders = (allStatusRows ?? []).length;

  // --- Revenue by category ---
  const categoryRevMap = new Map<string, number>();
  for (const row of (itemRows ?? []) as unknown as ItemRow[]) {
    const cat = row.products?.category ?? "other";
    const rev = row.quantity * row.unit_price;
    categoryRevMap.set(cat, (categoryRevMap.get(cat) ?? 0) + rev);
  }
  const categoryRevList = [...categoryRevMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCatRevenue = categoryRevList[0]?.[1] ?? 1;

  // Available categories + products for filter dropdowns
  const { data: allProducts } = await service
    .from("products")
    .select("id, name, category")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("name", { ascending: true });

  const availableCategories = [...new Set((allProducts ?? []).map((r) => r.category))];
  const availableProducts = (allProducts ?? []).map((p) => ({ id: p.id, name: p.name, category: p.category }));

  const selectedProductName = product_id
    ? availableProducts.find((p) => p.id === product_id)?.name
    : undefined;

  return (
    <main className="flex-1 px-6 md:px-10 py-12 max-w-5xl">
      {/* Header */}
      <header className="mb-10">
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

      {/* Filter bar */}
      <AnalyticsFilterBar
        period={period}
        category={category}
        month={month}
        season={season}
        productId={product_id}
        availableCategories={availableCategories}
        availableProducts={availableProducts}
      />

      {/* Revenue comparison */}
      <section className="mb-12">
        <h2 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-6">
          Revenue &mdash; {rangeLabel}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface-container-low rounded-xl p-6">
            <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-3">{rangeLabel}</p>
            <p className="text-3xl font-headline italic text-tertiary">{formatCents(currentRevenue)}</p>
            <p className="text-xs text-on-surface-variant mt-2">{currentRows?.length ?? 0} orders</p>
          </div>

          <div className="bg-surface-container-low rounded-xl p-6">
            <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-3">Previous Period</p>
            <p className="text-3xl font-headline italic text-tertiary">{formatCents(prevRevenue)}</p>
            <p className="text-xs text-on-surface-variant mt-2">{prevRows?.length ?? 0} orders</p>
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
              {revenueUpDown === "up" ? "More than previous period" : "Less than previous period"}
            </p>
          </div>
        </div>
      </section>

      {/* Monthly revenue trend */}
      <section className="mb-12">
        <h2 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-6">
          Revenue Trend (Last 6 Months)
        </h2>
        <div className="bg-surface-container-low rounded-xl p-6">
          <div className="flex items-end gap-3 h-36">
            {monthBuckets.map((amount, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-on-surface-variant">
                  {amount > 0 ? `$${(amount / 100).toFixed(0)}` : ""}
                </span>
                <div className="w-full flex flex-col justify-end" style={{ height: "90px" }}>
                  <div
                    className={`w-full rounded-t transition-all duration-700 ${
                      i === monthBuckets.length - 1 ? "bg-primary" : "bg-surface-container-highest"
                    }`}
                    style={{ height: `${pct(amount, maxMonthRevenue)}%`, minHeight: amount > 0 ? "4px" : "0" }}
                  />
                </div>
                <span className="text-[10px] font-label text-on-surface-variant">{monthLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue by category */}
      <section className="mb-12">
        <h2 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-6">
          Revenue by Product Type
        </h2>
        {categoryRevList.length === 0 ? (
          <p className="text-sm text-on-surface-variant italic">No data yet.</p>
        ) : (
          <div className="bg-surface-container-low rounded-xl overflow-hidden">
            {categoryRevList.map(([cat, rev], i) => (
              <div
                key={cat}
                className={`px-6 py-4 flex items-center gap-4 ${i % 2 === 1 ? "bg-surface-container/40" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-tertiary">{CATEGORY_LABELS[cat] ?? cat}</p>
                  <div className="mt-1.5 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-700"
                      style={{ width: `${pct(rev, maxCatRevenue)}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm font-bold text-secondary shrink-0">{formatCents(rev)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top products */}
      <section className="mb-12">
        <h2 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-6">
          {selectedProductName
          ? `Product: ${selectedProductName}`
          : category
          ? `Top Products — ${CATEGORY_LABELS[category] ?? category}`
          : "Top Products"}
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
                  <p className="text-[10px] text-on-surface-variant">{CATEGORY_LABELS[product.category] ?? product.category}</p>
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
            { status: "ready", label: "Ready", icon: "storefront", color: "text-secondary" },
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
