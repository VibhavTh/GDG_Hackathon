import { cacheLife, cacheTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export async function getProductCategories(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const service = createServiceClient();
  const { data } = await service
    .from("products")
    .select("category")
    .is("deleted_at", null)
    .eq("is_active", true);
  return [...new Set((data ?? []).map((r) => r.category).filter(Boolean))];
}

export async function getFeaturedProducts() {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const service = createServiceClient();
  const { data } = await service
    .from("products")
    .select("id, name, price, description, image_url, unit")
    .eq("is_active", true)
    .is("deleted_at", null)
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .limit(4);
  return data ?? [];
}

export async function getUpcomingEvents() {
  "use cache";
  cacheLife("hours");
  cacheTag("events");

  const service = createServiceClient();
  const { data } = await service
    .from("events")
    .select("id, title, description, event_date, event_time, location")
    .eq("is_published", true)
    .gte("event_date", new Date().toISOString().slice(0, 10))
    .order("event_date", { ascending: true })
    .limit(4);
  return data ?? [];
}
