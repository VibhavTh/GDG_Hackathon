// Run with: node scripts/seed-demo-orders.mjs
// Inserts realistic dummy orders using real product IDs from your DB.
// Safe to re-run -- orders are tagged with guest_email containing "demo-seed"
// so you can identify and delete them later if needed.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uqfebwtoyoyihygekppa.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY. Run with:");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-demo-orders.mjs");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const GUEST_EMAILS = [
  "sarah.miller@demo-seed.com",
  "james.oconnor@demo-seed.com",
  "priya.patel@demo-seed.com",
  "tom.nguyen@demo-seed.com",
  "lucia.romano@demo-seed.com",
  "alex.chen@demo-seed.com",
  "mary.washington@demo-seed.com",
  "derek.farms@demo-seed.com",
];

const STATUSES = ["fulfilled", "fulfilled", "fulfilled", "ready", "confirmed", "preparing", "placed"];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n, hourOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hourOffset, randomBetween(0, 59), 0, 0);
  return d.toISOString();
}

function orderNumber() {
  return `GM-DEMO-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

async function main() {
  // Fetch real active products
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price")
    .eq("is_active", true)
    .is("deleted_at", null)
    .limit(20);

  if (error || !products?.length) {
    console.error("Could not fetch products:", error?.message ?? "No active products found");
    process.exit(1);
  }

  console.log(`Found ${products.length} products. Seeding demo orders...`);

  // Build ~20 orders spread across the last 7 days
  const orderDefs = [
    // Today
    { daysBack: 0, hour: 9,  qty: [1, 2], status: "placed" },
    { daysBack: 0, hour: 11, qty: [2, 3], status: "confirmed" },
    { daysBack: 0, hour: 14, qty: [1, 1], status: "preparing" },
    { daysBack: 0, hour: 16, qty: [3, 4], status: "ready" },
    // Yesterday
    { daysBack: 1, hour: 8,  qty: [1, 2], status: "fulfilled" },
    { daysBack: 1, hour: 10, qty: [2, 2], status: "fulfilled" },
    { daysBack: 1, hour: 15, qty: [1, 3], status: "fulfilled" },
    // 2 days ago
    { daysBack: 2, hour: 9,  qty: [2, 3], status: "fulfilled" },
    { daysBack: 2, hour: 13, qty: [1, 2], status: "fulfilled" },
    // 3 days ago
    { daysBack: 3, hour: 10, qty: [1, 1], status: "fulfilled" },
    { daysBack: 3, hour: 16, qty: [2, 4], status: "fulfilled" },
    // 4 days ago
    { daysBack: 4, hour: 11, qty: [1, 2], status: "fulfilled" },
    { daysBack: 4, hour: 14, qty: [3, 3], status: "fulfilled" },
    // 5 days ago
    { daysBack: 5, hour: 9,  qty: [1, 3], status: "fulfilled" },
    { daysBack: 5, hour: 15, qty: [2, 2], status: "fulfilled" },
    // 6 days ago
    { daysBack: 6, hour: 10, qty: [1, 2], status: "fulfilled" },
    { daysBack: 6, hour: 13, qty: [2, 3], status: "fulfilled" },
  ];

  let created = 0;

  for (const def of orderDefs) {
    // Pick 1-2 random products for this order
    const itemCount = randomBetween(1, 2);
    const shuffled = [...products].sort(() => Math.random() - 0.5).slice(0, itemCount);
    const email = GUEST_EMAILS[randomBetween(0, GUEST_EMAILS.length - 1)];
    const createdAt = daysAgo(def.daysBack, def.hour);

    const items = shuffled.map((p) => ({
      product_id: p.id,
      quantity: randomBetween(def.qty[0], def.qty[1]),
      unit_price: p.price,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    // Insert order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        guest_email: email,
        status: def.status,
        total_amount: totalAmount,
        created_at: createdAt,
        updated_at: createdAt,
        stripe_session_id: null,
        stripe_payment_intent: null,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error(`Failed to insert order:`, orderErr?.message);
      continue;
    }

    // Insert order items
    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((item) => ({ ...item, order_id: order.id }))
    );

    if (itemsErr) {
      console.error(`Failed to insert items for order ${order.id}:`, itemsErr.message);
    } else {
      created++;
      const names = shuffled.map((p) => p.name).join(", ");
      console.log(`  [${def.status}] ${email.split("@")[0]} -- ${names} -- $${(totalAmount / 100).toFixed(2)}`);
    }
  }

  console.log(`\nDone. Created ${created}/${orderDefs.length} demo orders.`);
  console.log(`To remove them later: delete from orders where guest_email like '%-demo-seed.com'`);
}

main();
