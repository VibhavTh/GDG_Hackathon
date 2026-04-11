import { cacheLife, cacheTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export async function getSiteSettings() {
  "use cache";
  cacheLife("hours");
  cacheTag("site-settings");

  const service = createServiceClient();
  const { data } = await service
    .from("site_settings")
    .select("name, description, location, image_url, categories")
    .eq("id", 1)
    .single();
  return data;
}
