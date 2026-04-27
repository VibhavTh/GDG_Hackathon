import { createServiceClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/twilio";
import { stripe } from "@/lib/stripe/server";
import { LOW_STOCK_THRESHOLD } from "@/config/site";
import type { OrderStatus } from "@/lib/supabase/types";
import type {
  UpdateStockArgs,
  SetStockAbsoluteArgs,
  ToggleProductActiveArgs,
  DeleteProductArgs,
  AdvanceOrderStatusArgs,
  CancelOrderArgs,
  QueryOrdersArgs,
  QueryInventoryArgs,
  QueryRevenueArgs,
} from "./types";

const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "fulfilled",
};

// Resolves a product by name using ilike -- returns the product or a spoken
// disambiguation reply if multiple matches are found.
type ProductRow = { id: string; name: string; stock: number; is_active: boolean; price: number; unit: string };

// Score how well a spoken name matches a product name (0 = no match, higher = better)
function matchScore(spoken: string, productName: string): number {
  const a = spoken.toLowerCase();
  const b = productName.toLowerCase();
  if (a === b) return 100;
  if (b.includes(a) || a.includes(b)) return 80;
  // Word-level overlap: "cherry tomatoes" vs "Tomato" shares "tomato"
  const aWords = a.split(/\s+/);
  const bWords = b.split(/\s+/);
  const shared = aWords.filter((w) =>
    w.length > 2 && bWords.some((bw) => bw.startsWith(w) || w.startsWith(bw))
  );
  return shared.length > 0 ? 40 + shared.length * 10 : 0;
}

async function resolveProduct(name: string) {
  const service = createServiceClient();
  const { data } = await service
    .from("products")
    .select("id, name, stock, is_active, price, unit")
    .is("deleted_at", null);

  if (!data || data.length === 0) {
    return { product: null, reply: "You don't have any products in your inventory yet." };
  }

  const scored = (data as ProductRow[])
    .map((p) => ({ product: p, score: matchScore(name, p.name) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { product: null, reply: `I couldn't find a product called "${name}". Could you check the spelling?` };
  }
  // If top two scores are tied and both high, ask for clarification
  if (scored.length > 1 && scored[0].score === scored[1].score && scored[0].score < 80) {
    const names = scored.slice(0, 3).map((x) => x.product.name).join(", ");
    return { product: null, reply: `I found a few possible matches: ${names}. Which one did you mean?` };
  }
  return { product: scored[0].product, reply: null };
}

export async function runUpdateStock(args: UpdateStockArgs): Promise<string> {
  const { product, reply } = await resolveProduct(args.productName);
  if (!product) return reply!;

  const service = createServiceClient();
  const newStock = Math.max(0, product.stock + args.delta);
  const { error } = await service.from("products").update({ stock: newStock }).eq("id", product.id);
  if (error) {
    console.error("[voice updateStock]", error);
    return `Sorry, I couldn't update ${product.name}. Please try again.`;
  }

  const direction = args.delta >= 0 ? "up to" : "down to";
  return `${product.name} stock is now ${direction} ${newStock} units.`;
}

export async function runSetStockAbsolute(args: SetStockAbsoluteArgs): Promise<string> {
  const { product, reply } = await resolveProduct(args.productName);
  if (!product) return reply!;

  const service = createServiceClient();
  const { error } = await service.from("products").update({ stock: args.quantity }).eq("id", product.id);
  if (error) {
    console.error("[voice setStockAbsolute]", error);
    return `Sorry, I couldn't update ${product.name}. Please try again.`;
  }

  return `${product.name} is now set to ${args.quantity} units.`;
}

export async function runToggleProductActive(args: ToggleProductActiveArgs): Promise<string> {
  const { product, reply } = await resolveProduct(args.productName);
  if (!product) return reply!;

  const service = createServiceClient();
  const { error } = await service
    .from("products")
    .update({ is_active: args.active, updated_at: new Date().toISOString() })
    .eq("id", product.id);
  if (error) {
    console.error("[voice toggleProductActive]", error);
    return `Sorry, I couldn't update ${product.name}. Please try again.`;
  }

  return `${product.name} is now ${args.active ? "live on the store" : "hidden from the store"}.`;
}

export async function runDeleteProduct(args: DeleteProductArgs): Promise<string> {
  const { product, reply } = await resolveProduct(args.productName);
  if (!product) return reply!;

  const service = createServiceClient();
  await service
    .from("products")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", product.id);

  return `${product.name} has been removed from your inventory.`;
}

export async function runAdvanceOrderStatus(args: AdvanceOrderStatusArgs): Promise<string> {
  const service = createServiceClient();

  const { data: order } = await service
    .from("orders")
    .select("id, status, order_number, customer_phone")
    .eq("id", args.orderId)
    .single();

  if (!order) return "I couldn't find that order.";

  const nextStatus = VALID_TRANSITIONS[order.status as OrderStatus];
  if (!nextStatus) {
    return `Order ${order.order_number ?? args.orderId} is already at its final status.`;
  }

  await service
    .from("orders")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", args.orderId);

  if (nextStatus === "ready" && order.customer_phone) {
    try {
      const { data: site } = await service.from("site_settings").select("name").eq("id", 1).single();
      const farmName = site?.name ?? "Green Market Farms";
      await sendSms({
        to: order.customer_phone,
        body: `Your order from ${farmName} is ready for pickup!`,
      });
    } catch {
      // Non-fatal
    }
  }

  return `Order ${order.order_number ?? args.orderId} moved to ${nextStatus}.`;
}

export async function runCancelOrder(args: CancelOrderArgs): Promise<string> {
  const service = createServiceClient();

  const { data: order } = await service
    .from("orders")
    .select("id, status, order_number, stripe_payment_intent")
    .eq("id", args.orderId)
    .single();

  if (!order) return "I couldn't find that order.";

  await service
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", args.orderId);

  if (order.stripe_payment_intent) {
    try {
      await stripe.refunds.create({ payment_intent: order.stripe_payment_intent });
    } catch (err) {
      console.error("[voice cancelOrder] refund failed:", err);
    }
  }

  return `Order ${order.order_number ?? args.orderId} has been cancelled and refunded.`;
}

export async function runQueryOrders(args: QueryOrdersArgs): Promise<string> {
  const service = createServiceClient();

  let query = service
    .from("orders")
    .select("id, order_number, status, total_amount, created_at");

  if (args.filter === "needs_fulfilling") {
    query = query.in("status", ["placed", "confirmed", "preparing", "ready"]);
  } else if (args.filter === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    query = query.gte("created_at", start.toISOString());
  } else if (args.status) {
    query = query.eq("status", args.status);
  }

  const { data } = await query.order("created_at", { ascending: false }).limit(20);

  if (!data || data.length === 0) {
    return "No orders found for that filter.";
  }

  if (args.filter === "needs_fulfilling") {
    return `You have ${data.length} order${data.length === 1 ? "" : "s"} that need attention.`;
  }

  if (args.filter === "today") {
    return `You received ${data.length} order${data.length === 1 ? "" : "s"} today.`;
  }

  return `Found ${data.length} order${data.length === 1 ? "" : "s"}.`;
}

export async function runQueryInventory(args: QueryInventoryArgs): Promise<string> {
  const service = createServiceClient();

  if (args.productName) {
    const { product, reply } = await resolveProduct(args.productName);
    if (!product) return reply!;
    return `${product.name} has ${product.stock} units in stock.`;
  }

  if (args.filter === "low_stock") {
    const { data } = await service
      .from("products")
      .select("name, stock")
      .is("deleted_at", null)
      .eq("is_active", true)
      .lte("stock", LOW_STOCK_THRESHOLD)
      .gt("stock", 0)
      .order("stock", { ascending: true });

    if (!data || data.length === 0) return "Everything looks well-stocked.";

    const list = data.map((p) => `${p.name} (${p.stock})`).join(", ");
    return `Low stock: ${list}.`;
  }

  const { data } = await service
    .from("products")
    .select("name, stock")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("name");

  if (!data || data.length === 0) return "No active products found.";

  const list = data.map((p) => `${p.name} with ${p.stock} in stock`).join(", ");
  return `You have ${data.length} active product${data.length === 1 ? "" : "s"}: ${list}.`;
}

export async function runQueryRevenue(args: QueryRevenueArgs): Promise<string> {
  const service = createServiceClient();

  const now = new Date();
  let start: Date;

  if (args.period === "today") {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
  } else if (args.period === "this_week") {
    start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const { data } = await service
    .from("orders")
    .select("total_amount")
    .in("status", ["confirmed", "preparing", "ready", "fulfilled"])
    .gte("created_at", start.toISOString());

  if (!data || data.length === 0) {
    return `No revenue recorded for ${args.period.replace("_", " ")}.`;
  }

  const totalCents = data.reduce((sum, o) => sum + o.total_amount, 0);
  const dollars = (totalCents / 100).toFixed(2);
  const label = args.period === "today" ? "today" : args.period === "this_week" ? "this week" : "this month";
  return `Revenue ${label}: $${dollars} from ${data.length} order${data.length === 1 ? "" : "s"}.`;
}
