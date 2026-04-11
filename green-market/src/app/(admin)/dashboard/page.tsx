import { Suspense } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getDashboardStats, getRecentActiveOrders } from "@/lib/queries/dashboard-stats";
import type { OrderStatus } from "@/lib/supabase/types";
import { SalesChart } from "./sales-chart";
import { HarvestCalendar } from "./harvest-calendar";


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

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const [site, stats, recentOrders] = await Promise.all([
    getSiteSettings(),
    getDashboardStats(),
    getRecentActiveOrders(),
  ]);

  const profileIncomplete = site && (!site.description || !site.location);
  const {
    activeOrderCount,
    totalRevenue,
    weeklyBars,
    dailyBars,
    lowStockProducts,
    upcomingEvents,
    seasonalProducts,
  } = stats;

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
            Manage your produce, flowers, and nursery listings.
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
          <HarvestCalendar
            events={(upcomingEvents ?? []).map((e) => ({
              id: e.id,
              title: e.title,
              date: e.event_date,
              time: e.event_time ?? undefined,
            }))}
            seasonalProducts={(seasonalProducts ?? []).map((p) => ({
              name: p.name,
              available_from: p.available_from!,
              available_until: p.available_until ?? undefined,
            }))}
          />
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
