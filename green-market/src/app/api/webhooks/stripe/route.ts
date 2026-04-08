import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/server";

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

        // Call atomic confirm_order RPC — updates status, decrements stock, records webhook
        const { error: rpcError } = await supabase.rpc("confirm_order", {
          p_event_id: event.id,
          p_order_id: orderId,
          p_payment_intent_id: paymentIntentId ?? "",
        });

        if (rpcError) {
          console.error("confirm_order RPC error:", rpcError);
          return NextResponse.json({ error: "Failed to confirm order" }, { status: 500 });
        }

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
            .eq("status", "pending_payment"); // only if still pending
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

        if (order && order.status === "pending_payment") {
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
        // Unhandled event type — still return 200 so Stripe doesn't retry
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
