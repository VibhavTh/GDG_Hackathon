"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";

const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "fulfilled",
};

async function getFarm() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/farmer/login");

  const service = createServiceClient();
  const { data: farmData } = await service
    .from("farms")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!farmData) redirect("/farmer/setup");
  return { supabase, farmId: (farmData as { id: string }).id };
}

export async function advanceOrderStatus(
  orderId: string,
  currentStatus: OrderStatus
) {
  const { supabase } = await getFarm();

  const nextStatus = VALID_TRANSITIONS[currentStatus];
  if (!nextStatus) return;

  await supabase
    .from("orders")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  revalidatePath("/orders");
  revalidatePath("/dashboard");
}

export async function cancelOrder(orderId: string) {
  const { supabase } = await getFarm();

  await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  revalidatePath("/orders");
  revalidatePath("/dashboard");
}
