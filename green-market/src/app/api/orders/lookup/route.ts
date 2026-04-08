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

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
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
    `)
    .eq("order_number", orderNumber)
    .ilike("guest_email", email)
    .neq("status", "pending_payment") // don't expose unpaid orders
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: "No order found with that order number and email" },
      { status: 404 }
    );
  }

  return NextResponse.json({ order });
}
