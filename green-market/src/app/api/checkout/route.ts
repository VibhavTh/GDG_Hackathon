import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { calculatePlatformFeeCents } from "@/lib/stripe/config";

interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
  farmId?: string; // optional -- server derives from DB as source of truth
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

  const supabase = createServiceClient();

  // Verify stock + prices against DB; also fetch farm_id as source of truth
  const productIds = items.map((i) => i.productId);
  const { data: dbProducts, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, stock, is_active, deleted_at, farm_id")
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

  // Derive farm IDs from DB products (not client-sent farmId)
  const uniqueFarmIds = [...new Set(dbProducts.map((p) => p.farm_id))];

  // Fetch farms for Connect status
  const { data: farms, error: farmsError } = await supabase
    .from("farms")
    .select("*")
    .in("id", uniqueFarmIds);

  if (farmsError || !farms) {
    console.error("Farms query error:", farmsError, "farmIds:", uniqueFarmIds);
    return NextResponse.json({ error: "Failed to verify farms" }, { status: 500 });
  }

  const farmMap = new Map(farms.map((f) => [f.id, f]));

  // Calculate totals from DB prices (dbPrice is already in cents)
  const subtotalCents = items.reduce((sum, item) => {
    const dbPrice = productMap.get(item.productId)!.price;
    return sum + dbPrice * item.quantity;
  }, 0);
  const fulfillmentFeeCents = fulfillmentType === "delivery" ? Math.round(FULFILLMENT_FEE * 100) : 0;
  const totalCents = subtotalCents + fulfillmentFeeCents;

  // Calculate per-farm subtotals and platform fees (using DB farm_id)
  const farmBreakdown = new Map<string, { subtotalCents: number; platformFeeCents: number }>();
  for (const item of items) {
    const dbProduct = productMap.get(item.productId)!;
    const itemTotal = dbProduct.price * item.quantity;
    const farmId = dbProduct.farm_id;
    const existing = farmBreakdown.get(farmId) ?? { subtotalCents: 0, platformFeeCents: 0 };
    existing.subtotalCents += itemTotal;
    farmBreakdown.set(farmId, existing);
  }

  let totalPlatformFeeCents = 0;
  for (const [, breakdown] of farmBreakdown) {
    breakdown.platformFeeCents = calculatePlatformFeeCents(breakdown.subtotalCents);
    totalPlatformFeeCents += breakdown.platformFeeCents;
  }

  // Create order row
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId ?? null,
      guest_email: customerEmail.toLowerCase().trim(),
      total_amount: totalCents,
      platform_fee_cents: totalPlatformFeeCents,
      status: "placed",
      special_instructions: specialInstructions?.trim() || null,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Order insert error:", orderError);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  // Insert order_items (farm_id from DB, not client)
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    farm_id: productMap.get(item.productId)!.farm_id,
    quantity: item.quantity,
    unit_price: productMap.get(item.productId)!.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    console.error("Order items insert error:", itemsError);
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: "Failed to save order items" }, { status: 500 });
  }

  // Insert farm_transfers rows (one per connected farm) with status 'pending'
  const farmTransferRows = [];
  for (const [farmId, breakdown] of farmBreakdown) {
    const farm = farmMap.get(farmId) as Record<string, unknown> | undefined;
    if (!farm?.stripe_account_id || !farm.payouts_enabled) continue;

    const transferAmount = breakdown.subtotalCents - breakdown.platformFeeCents;
    farmTransferRows.push({
      order_id: order.id,
      farm_id: farmId,
      stripe_account_id: farm.stripe_account_id as string,
      amount_cents: transferAmount,
      platform_fee_cents: breakdown.platformFeeCents,
      status: "pending" as const,
    });
  }

  if (farmTransferRows.length > 0) {
    const { error: transferError } = await supabase.from("farm_transfers").insert(farmTransferRows);
    if (transferError) {
      console.error("Farm transfers insert error:", transferError);
      // Non-fatal: transfers can be retried via webhook
    }
  }

  // Create Stripe Checkout Session (plain charge -- no transfer_data)
  try {
    const lineItems: { price_data: { currency: string; product_data: { name: string; images?: string[] }; unit_amount: number }; quantity: number }[] = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${item.name} (per ${item.unit})`,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: productMap.get(item.productId)!.price, // already in cents
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

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "payment",
      customer_email: customerEmail.toLowerCase().trim(),
      line_items: lineItems,
      metadata: {
        order_id: order.id,
        farm_ids: uniqueFarmIds.join(","),
        customer_name: customerName.trim(),
        customer_phone: customerPhone?.trim() || "",
        fulfillment_type: fulfillmentType,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

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
