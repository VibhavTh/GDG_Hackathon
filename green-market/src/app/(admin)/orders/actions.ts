"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { sendSms } from "@/lib/twilio";
import type { OrderStatus } from "@/lib/supabase/types";

const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "fulfilled",
};

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");
  return { supabase };
}

export async function advanceOrderStatus(
  orderId: string,
  currentStatus: OrderStatus
) {
  const { supabase } = await requireAuth();
  const service = createServiceClient();

  const nextStatus = VALID_TRANSITIONS[currentStatus];
  if (!nextStatus) return;

  await supabase
    .from("orders")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  // Send SMS to customer when order is ready for pickup
  if (nextStatus === "ready") {
    try {
      const [{ data: order }, { data: site }] = await Promise.all([
        service.from("orders").select("customer_phone").eq("id", orderId).single(),
        service.from("site_settings").select("name").eq("id", 1).single(),
      ]);

      if (order?.customer_phone) {
        const farmName = site?.name ?? "Green Market Farms";
        await sendSms({
          to: order.customer_phone,
          body: `Your order from ${farmName} is ready for pickup! See you soon.`,
        });
      }
    } catch (err) {
      // Non-fatal -- order is advanced, SMS failure should not block the action
      console.error("[SMS] Failed to send ready notification:", err);
    }
  }

  updateTag("dashboard");
  updateTag("orders");
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}

export async function cancelOrder(orderId: string) {
  await requireAuth();
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

  // Refund the customer
  if (order.stripe_payment_intent) {
    try {
      await stripe.refunds.create({
        payment_intent: order.stripe_payment_intent,
      });
    } catch (err) {
      console.error("Refund failed for order", orderId, err);
    }
  }

  updateTag("dashboard");
  updateTag("orders");
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}
