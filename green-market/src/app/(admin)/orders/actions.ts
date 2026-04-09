"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
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
  if (!user) redirect("/vendor/login");

  const service = createServiceClient();
  const { data: farmData } = await service
    .from("farms")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!farmData) redirect("/vendor/setup");
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
  const service = createServiceClient();

  // Fetch order to check for payment intent
  const { data: order } = await service
    .from("orders")
    .select("id, status, stripe_payment_intent")
    .eq("id", orderId)
    .single();

  if (!order) return;

  // Update status to cancelled
  await service
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  // Reverse completed farm transfers, then refund the customer
  if (order.stripe_payment_intent) {
    // Step 1: Reverse each completed transfer
    const { data: completedTransfers } = await service
      .from("farm_transfers")
      .select("id, stripe_transfer_id")
      .eq("order_id", orderId)
      .eq("status", "completed");

    if (completedTransfers) {
      for (const t of completedTransfers) {
        if (!t.stripe_transfer_id) continue;
        try {
          await stripe.transfers.createReversal(t.stripe_transfer_id);
          await service
            .from("farm_transfers")
            .update({ status: "reversed", updated_at: new Date().toISOString() })
            .eq("id", t.id);
        } catch (err) {
          console.error("Transfer reversal failed for", t.stripe_transfer_id, err);
        }
      }
    }

    // Step 2: Refund the customer (transfers already reversed above)
    try {
      await stripe.refunds.create({
        payment_intent: order.stripe_payment_intent,
      });
    } catch (err) {
      console.error("Refund failed for order", orderId, err);
    }
  }

  revalidatePath("/orders");
  revalidatePath("/dashboard");
}
