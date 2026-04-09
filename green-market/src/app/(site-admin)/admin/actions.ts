"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export async function markMessageRead(id: string) {
  const service = createServiceClient();
  await service
    .from("admin_messages")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin");
}

export async function archiveMessage(id: string) {
  const service = createServiceClient();
  await service
    .from("admin_messages")
    .update({ archived_at: new Date().toISOString(), is_read: true })
    .eq("id", id);
  revalidatePath("/admin");
}
