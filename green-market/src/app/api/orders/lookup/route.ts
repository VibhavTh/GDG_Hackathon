import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber")?.trim().toUpperCase();
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!orderNumber || !email) {
    return NextResponse.json(
      { error: "Both orderNumber and email are required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const SELECT = `
    id,
    order_number,
    status,
    total_amount,
    special_instructions,
    created_at,
    updated_at,
    order_items (
      id,
      quantity,
      unit_price,
      products (
        id,
        name,
        image_url
      )
    )
  `;

  // Try exact order_number match first
  let { data: order } = await supabase
    .from("orders")
    .select(SELECT)
    .eq("order_number", orderNumber)
    .ilike("guest_email", email)
    .neq("status", "pending_payment")
    .single();

  // Fallback: match on the first 8 chars of the UUID (what we display when order_number is null)
  if (!order) {
    const { data: rows } = await supabase
      .from("orders")
      .select(SELECT)
      .ilike("guest_email", email)
      .neq("status", "pending_payment")
      .order("created_at", { ascending: false })
      .limit(200); // scan recent orders for ID-prefix match

    order = (rows ?? []).find(
      (r) => r.id.slice(0, 8).toUpperCase() === orderNumber
    ) ?? null;
  }

  if (!order) {
    return NextResponse.json(
      { error: "No order found with that order number and email" },
      { status: 404 }
    );
  }

  return NextResponse.json({ order });
}
