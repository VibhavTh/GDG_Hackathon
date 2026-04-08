import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import OrderList from "./order-list";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/farmer/login");

  const service = createServiceClient();

  const { data: farmData } = await service
    .from("farms")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!farmData) redirect("/farmer/onboarding");
  const farm = farmData as { id: string };

  const { data: summaries } = await service
    .from("farm_order_summary")
    .select("*")
    .eq("farm_id", farm.id)
    .order("order_date", { ascending: false });

  const orderIds = (summaries ?? []).map((s) => s.order_id);

  const { data: details } =
    orderIds.length > 0
      ? await service
          .from("orders")
          .select(
            "id, special_instructions, order_items(id, quantity, unit_price, products(name, image_url))"
          )
          .in("id", orderIds)
      : { data: [] };

  const detailMap = new Map((details ?? []).map((d) => [d.id, d]));

  const orders = (summaries ?? []).map((s) => ({
    order_id: s.order_id,
    customer_id: s.customer_id,
    guest_email: s.guest_email,
    status: s.status,
    order_date: s.order_date,
    farm_subtotal: s.farm_subtotal,
    special_instructions:
      detailMap.get(s.order_id)?.special_instructions ?? null,
    order_items:
      ((detailMap.get(s.order_id)?.order_items ?? []) as unknown as {
        id: string;
        quantity: number;
        unit_price: number;
        products: { name: string; image_url: string | null } | null;
      }[]),
  }));

  return <OrderList orders={orders} />;
}
