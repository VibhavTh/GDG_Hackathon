import { cacheLife, cacheTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { LOW_STOCK_THRESHOLD } from "@/config/site";
import type { OrderStatus } from "@/lib/supabase/types";

type BarData = { label: string; amount: number; isHighlight: boolean };

export type DashboardStats = {
  activeOrderCount: number;
  totalRevenue: number;
  weeklyBars: BarData[];
  dailyBars: BarData[];
  lowStockProducts: { id: string; name: string; stock: number }[];
  upcomingEvents: { id: string; title: string; event_date: string; event_time: string | null; location: string | null }[];
  seasonalProducts: { id: string; name: string; available_from: string; available_until: string | null }[];
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_BUCKETS = ["12a", "4a", "8a", "12p", "4p", "8p"];

export async function getDashboardStats(): Promise<DashboardStats> {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");

  const service = createServiceClient();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const sixtyDaysOut = new Date();
  sixtyDaysOut.setDate(sixtyDaysOut.getDate() + 60);

  const [
    { count: activeOrderCount },
    { data: revenueRows },
    { data: weeklyRows },
    { data: todayRows },
    { data: lowStock },
    { data: events },
    { data: seasonal },
  ] = await Promise.all([
    service
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["placed", "confirmed", "preparing", "ready"]),
    service.from("orders").select("total_amount").eq("status", "fulfilled"),
    service
      .from("orders")
      .select("created_at, total_amount")
      .in("status", ["confirmed", "preparing", "ready", "fulfilled"])
      .gte("created_at", weekAgo.toISOString()),
    service
      .from("orders")
      .select("created_at, total_amount")
      .in("status", ["confirmed", "preparing", "ready", "fulfilled"])
      .gte("created_at", todayStart.toISOString()),
    service
      .from("products")
      .select("id, name, stock")
      .lte("stock", LOW_STOCK_THRESHOLD)
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("stock", { ascending: true })
      .limit(5),
    service
      .from("events")
      .select("id, title, event_date, event_time, location")
      .eq("is_published", true)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .lte("event_date", sixtyDaysOut.toISOString().split("T")[0])
      .order("event_date", { ascending: true })
      .limit(20),
    service
      .from("products")
      .select("id, name, available_from, available_until")
      .is("deleted_at", null)
      .eq("is_active", true)
      .not("available_from", "is", null),
  ]);

  const totalRevenue = (revenueRows ?? []).reduce(
    (sum, r) => sum + (r.total_amount as number),
    0,
  );

  // Weekly bars
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

  // Hourly bars
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

  return {
    activeOrderCount: activeOrderCount ?? 0,
    totalRevenue,
    weeklyBars,
    dailyBars,
    lowStockProducts: (lowStock ?? []) as DashboardStats["lowStockProducts"],
    upcomingEvents: (events ?? []) as DashboardStats["upcomingEvents"],
    seasonalProducts: (seasonal ?? []) as DashboardStats["seasonalProducts"],
  };
}

export type RecentOrder = {
  order_id: string;
  initials: string;
  name: string;
  status: OrderStatus;
  items: string;
  total_amount: number;
};

export async function getRecentActiveOrders(): Promise<RecentOrder[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  const service = createServiceClient();

  const { data: rows } = await service
    .from("orders")
    .select("id, guest_email, customer_id, status, total_amount, order_items(id, quantity, products(name))")
    .in("status", ["placed", "confirmed", "preparing", "ready"])
    .order("created_at", { ascending: false })
    .limit(5);

  type RawRow = {
    id: string;
    guest_email: string | null;
    customer_id: string | null;
    status: OrderStatus;
    total_amount: number;
    order_items: { id: string; quantity: number; products: { name: string } | null }[];
  };

  return ((rows ?? []) as unknown as RawRow[]).map((o) => {
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
}
