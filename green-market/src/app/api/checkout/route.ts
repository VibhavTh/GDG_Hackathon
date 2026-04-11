import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

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
  items: CheckoutItem[];
  customerId?: string | null;
}

const FULFILLMENT_FEE = 4.0; // dollars

export async function POST(request: NextRequest) {
  let body: CheckoutBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { customerName, customerEmail, customerPhone, fulfillmentType, specialInstructions, items, customerId } = body;

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
  if (!items?.length || items.length > 50) {
    return NextResponse.json({ error: "Cart must have between 1 and 50 items" }, { status: 400 });
  }
  if (specialInstructions && specialInstructions.length > 500) {
    return NextResponse.json({ error: "Special instructions must be 500 characters or fewer" }, { status: 400 });
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
    // dbProduct.price is in cents, item.price is in dollars from the cart
    // Allow 1 cent tolerance for floating point
    if (Math.abs(dbProduct.price - Math.round(item.price * 100)) > 1) {
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

  // Pre-build validated items with DB prices -- every item is guaranteed in the map
  // because the unavailable check above returned early for any missing/inactive product.
  const validatedItems = items.map((item) => {
    const dbProduct = productMap.get(item.productId);
    if (!dbProduct) throw new Error(`Product ${item.productId} missing after validation`);
    return { ...item, dbPrice: dbProduct.price };
  });

  // Calculate totals from DB prices (dbPrice is already in cents)
  const subtotalCents = validatedItems.reduce((sum, item) => sum + item.dbPrice * item.quantity, 0);
  const fulfillmentFeeCents = fulfillmentType === "delivery" ? Math.round(FULFILLMENT_FEE * 100) : 0;
  const totalCents = subtotalCents + fulfillmentFeeCents;

  // Create order row
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId ?? null,
      guest_email: customerEmail.toLowerCase().trim(),
      total_amount: totalCents,
      status: "placed",
      special_instructions: specialInstructions?.trim() || null,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Order insert error:", orderError);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  // Insert order_items (price from DB, not client)
  const orderItems = validatedItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.dbPrice,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    console.error("Order items insert error:", itemsError);
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: "Failed to save order items" }, { status: 500 });
  }

  // Create Stripe Checkout Session via REST API (works in both edge and Node.js runtimes)
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!.trim().replace(/\/$/, "");
    // Build the success URL with the Stripe template variable -- must NOT be URL-encoded
    const successUrl = `${siteUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/checkout`;

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("customer_email", customerEmail.toLowerCase().trim());
    params.set("cancel_url", cancelUrl);
    params.set("expires_at", String(Math.floor(Date.now() / 1000) + 30 * 60));
    params.set("metadata[order_id]", order.id);
    params.set("metadata[customer_name]", customerName.trim());
    params.set("metadata[customer_phone]", customerPhone?.trim() || "");
    params.set("metadata[fulfillment_type]", fulfillmentType);

    const allLineItems = [
      ...validatedItems.map((item) => ({
        name: `${item.name} (per ${item.unit})`,
        amount: item.dbPrice,
        quantity: item.quantity,
        image: item.image || null,
      })),
      ...(fulfillmentFeeCents > 0
        ? [{ name: "Home Delivery Fee", amount: fulfillmentFeeCents, quantity: 1, image: null }]
        : []),
    ];

    allLineItems.forEach((item, i) => {
      params.set(`line_items[${i}][price_data][currency]`, "usd");
      params.set(`line_items[${i}][price_data][product_data][name]`, item.name);
      params.set(`line_items[${i}][price_data][unit_amount]`, String(item.amount));
      params.set(`line_items[${i}][quantity]`, String(item.quantity));
    });

    // success_url contains {CHECKOUT_SESSION_ID} which URLSearchParams would encode --
    // append it raw to the body string so Stripe receives the literal braces
    const body = params.toString() + `&success_url=${encodeURIComponent(successUrl).replace("%7BCHECKOUT_SESSION_ID%7D", "{CHECKOUT_SESSION_ID}")}`;

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Version": "2026-03-25.dahlia",
      },
      body,
    });

    const session = await stripeRes.json() as { id?: string; url?: string; error?: { message: string } };

    if (!stripeRes.ok || !session.url) {
      const msg = session.error?.message ?? "Unknown Stripe error";
      console.error("Stripe session error:", msg);
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      return NextResponse.json({ error: `Stripe error: ${msg}` }, { status: 500 });
    }

    // Update order with stripe_session_id
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (stripeError) {
    const msg = stripeError instanceof Error ? stripeError.message : String(stripeError);
    console.error("Stripe session error:", msg);
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: `Stripe error: ${msg}` }, { status: 500 });
  }
}
