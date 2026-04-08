import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

interface CheckoutBody {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentType: "delivery" | "pickup";
  specialInstructions: string;
  farmId: string;
  items: CheckoutItem[];
}

const FULFILLMENT_FEE = 4.0; // dollars

export async function POST(request: NextRequest) {
  let body: CheckoutBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { customerName, customerEmail, customerPhone, fulfillmentType, specialInstructions, farmId, items } = body;

  // Validate required fields
  if (!customerName?.trim() || customerName.trim().length > 100) {
    return NextResponse.json({ error: "Valid customer name is required" }, { status: 400 });
  }
  if (!customerEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
  }
  if (!fulfillmentType || !["delivery", "pickup"].includes(fulfillmentType)) {
    return NextResponse.json({ error: "Fulfillment type must be delivery or pickup" }, { status: 400 });
  }
  if (!farmId?.trim()) {
    return NextResponse.json({ error: "Farm ID is required" }, { status: 400 });
  }
  if (!items?.length || items.length > 50) {
    return NextResponse.json({ error: "Cart must have between 1 and 50 items" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify stock + prices against DB
  const productIds = items.map((i) => i.productId);
  const { data: dbProducts, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, stock, is_active, deleted_at")
    .in("id", productIds);

  if (productsError || !dbProducts) {
    return NextResponse.json({ error: "Failed to verify products" }, { status: 500 });
  }

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));
  const unavailable: string[] = [];
  const priceMismatch: string[] = [];

  for (const item of items) {
    const dbProduct = productMap.get(item.productId);
    if (!dbProduct || !dbProduct.is_active || dbProduct.deleted_at) {
      unavailable.push(item.name);
      continue;
    }
    if (dbProduct.stock < item.quantity) {
      unavailable.push(`${item.name} (only ${dbProduct.stock} in stock)`);
    }
    // Check for price mismatch (stale client data) — allow $0.01 tolerance
    if (Math.abs(dbProduct.price - item.price) > 0.01) {
      priceMismatch.push(item.name);
    }
  }

  if (unavailable.length > 0) {
    return NextResponse.json(
      { error: `Some items are unavailable: ${unavailable.join(", ")}` },
      { status: 400 }
    );
  }
  if (priceMismatch.length > 0) {
    return NextResponse.json(
      { error: `Prices have changed for: ${priceMismatch.join(", ")}. Please refresh and try again.` },
      { status: 400 }
    );
  }

  // Calculate totals from DB prices
  const subtotalCents = items.reduce((sum, item) => {
    const dbPrice = productMap.get(item.productId)!.price;
    return sum + Math.round(dbPrice * 100) * item.quantity;
  }, 0);
  const fulfillmentFeeCents = fulfillmentType === "delivery" ? Math.round(FULFILLMENT_FEE * 100) : 0;
  const totalCents = subtotalCents + fulfillmentFeeCents;

  // Create order row with pending_payment status
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: null,
      guest_email: customerEmail.toLowerCase().trim(),
      total_amount: totalCents / 100,
      status: "pending_payment" as const,
      special_instructions: specialInstructions?.trim() || null,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Order insert error:", orderError);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  // Insert order_items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    farm_id: farmId,
    quantity: item.quantity,
    unit_price: productMap.get(item.productId)!.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    console.error("Order items insert error:", itemsError);
    // Clean up the order
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: "Failed to save order items" }, { status: 500 });
  }

  // Create Stripe Checkout Session
  try {
    const lineItems: { price_data: { currency: string; product_data: { name: string; images?: string[] }; unit_amount: number }; quantity: number }[] = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${item.name} (per ${item.unit})`,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(productMap.get(item.productId)!.price * 100),
      },
      quantity: item.quantity,
    }));

    if (fulfillmentFeeCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Home Delivery Fee" },
          unit_amount: fulfillmentFeeCents,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail.toLowerCase().trim(),
      line_items: lineItems,
      metadata: {
        order_id: order.id,
        farm_id: farmId,
        customer_name: customerName.trim(),
        customer_phone: customerPhone?.trim() || "",
        fulfillment_type: fulfillmentType,
      },
      // Phase 2: add payment_intent_data: { transfer_data: { destination: farm.stripe_account_id } }
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    // Update order with stripe_session_id
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (stripeError) {
    console.error("Stripe session error:", stripeError);
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 });
  }
}
