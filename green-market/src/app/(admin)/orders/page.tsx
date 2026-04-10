import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import OrderList from "./order-list";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const service = createServiceClient();

  const { data: rows } = await service
    .from("orders")
    .select(
      "id, customer_id, guest_email, status, total_amount, created_at, special_instructions, order_items(id, quantity, unit_price, products(name, image_url))"
    )
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    customer_id: string | null;
    guest_email: string | null;
    status: string;
    total_amount: number;
    created_at: string;
    special_instructions: string | null;
    order_items: {
      id: string;
      quantity: number;
      unit_price: number;
      products: { name: string; image_url: string | null } | null;
    }[];
  };

  const orders = ((rows ?? []) as unknown as Row[]).map((o) => ({
    order_id: o.id,
    customer_id: o.customer_id,
    guest_email: o.guest_email,
    status: o.status as import("@/lib/supabase/types").OrderStatus,
    order_date: o.created_at,
    total_amount: o.total_amount,
    special_instructions: o.special_instructions,
    order_items: o.order_items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      unit_price: i.unit_price,
      products: i.products ? { name: i.products.name, image_url: i.products.image_url } : null,
    })),
  }));

  return <OrderList orders={orders} />;
}
