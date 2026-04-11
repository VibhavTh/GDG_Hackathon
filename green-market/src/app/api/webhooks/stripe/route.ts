import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { stripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendNewOrderEmail, sendCustomerConfirmationEmail } from "@/lib/email";
import { sendSms } from "@/lib/twilio";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Idempotency check
  const { data: existing } = await supabase
    .from("processed_webhooks")
    .select("stripe_event_id")
    .eq("stripe_event_id", event.id)
    .single();

  if (existing) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;
        const paymentIntentId = typeof session.payment_intent === "string"
          ? session.payment_intent
          : null;

        if (!orderId) {
          console.error("No order_id in session metadata", session.id);
          return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
        }

        // Call atomic confirm_order RPC -- updates status, decrements stock, records webhook
        const { error: rpcError } = await supabase.rpc("confirm_order", {
          p_event_id: event.id,
          p_order_id: orderId,
          p_payment_intent_id: paymentIntentId ?? "",
        });

        if (rpcError) {
          console.error("confirm_order RPC error:", rpcError);
          return NextResponse.json({ error: "Failed to confirm order" }, { status: 500 });
        }

        // Save customer phone from Stripe metadata so we can SMS on ready
        const customerPhone = session.metadata?.customer_phone?.trim() || null;
        if (customerPhone) {
          await supabase.from("orders").update({ customer_phone: customerPhone }).eq("id", orderId);
        }

        // Send email notification to farmer and customer
        try {
          const { data: orderData } = await supabase
            .from("orders")
            .select(`
              id,
              guest_email,
              total_amount,
              order_items (
                quantity,
                unit_price,
                products ( name )
              )
            `)
            .eq("id", orderId)
            .single();

          if (orderData && orderData.order_items.length > 0) {
            const { data: site } = await supabase
              .from("site_settings")
              .select("name, farmer_phone")
              .eq("id", 1)
              .single();

            const siteName = site?.name ?? "The Green Market Farm";
            const notifyEmail = process.env.FARM_NOTIFY_EMAIL;

            const items = orderData.order_items.map((i) => ({
              name: (i.products as unknown as { name: string } | null)?.name ?? "Product",
              quantity: i.quantity,
              unitPriceCents: i.unit_price,
            }));

            if (notifyEmail) {
              await sendNewOrderEmail({
                farmerEmail: notifyEmail,
                farmName: siteName,
                orderId: orderData.id,
                customerEmail: orderData.guest_email ?? "Guest",
                totalCents: orderData.total_amount,
                items,
              });
            }

            // Customer confirmation email
            if (orderData.guest_email) {
              await sendCustomerConfirmationEmail({
                customerEmail: orderData.guest_email,
                orderId: orderData.id,
                farmName: siteName,
                totalCents: orderData.total_amount,
                items,
              });
            }
          }
          // SMS notification to farmer
          if (site?.farmer_phone) {
            const itemSummary = items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
            const total = `$${(orderData.total_amount / 100).toFixed(2)}`;
            try {
              await sendSms({
                to: site.farmer_phone,
                body: `New order on Green Market! ${total} -- ${itemSummary}. Open your dashboard to confirm.`,
              });
            } catch (smsErr) {
              console.error("Failed to send farmer SMS:", smsErr);
            }
          }
        } catch (emailErr) {
          // Non-fatal -- order is confirmed, just log the email failure
          console.error("Failed to send email notification:", emailErr);
        }

        revalidateTag("dashboard", "max");
        revalidateTag("orders", "max");
        revalidateTag("products", "max");

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          await supabase
            .from("orders")
            .update({ status: "abandoned", updated_at: new Date().toISOString() })
            .eq("id", orderId)
            .eq("status", "placed"); // only if still pending
        }

        await supabase
          .from("processed_webhooks")
          .insert({ stripe_event_id: event.id });

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;

        // Find order by stripe_payment_intent
        const { data: order } = await supabase
          .from("orders")
          .select("id, status")
          .eq("stripe_payment_intent", paymentIntent.id)
          .single();

        if (order && order.status === "placed") {
          await supabase
            .from("orders")
            .update({ status: "failed", updated_at: new Date().toISOString() })
            .eq("id", order.id);
        }

        await supabase
          .from("processed_webhooks")
          .insert({ stripe_event_id: event.id });

        break;
      }

      default:
        // Unhandled event type -- still return 200 so Stripe doesn't retry
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
