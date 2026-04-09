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

  const { data: farmData } = await service
    .from("farms")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!farmData) redirect("/vendor/setup");
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

  type OrderItem = {
    id: string;
    quantity: number;
    unit_price: number;
    products: { name: string; image_url: string | null } | null;
  };

  const orders = (summaries ?? []).map((s) => {
    const detail = detailMap.get(s.order_id);
    const rawItems = detail?.order_items ?? [];
    const items = rawItems.map((item) => {
      const prod = item.products as unknown as { name: string; image_url: string | null } | null;
      return {
        id: item.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        products: prod ? { name: prod.name, image_url: prod.image_url } : null,
      };
    }) as OrderItem[];

    return {
      order_id: s.order_id,
      customer_id: s.customer_id,
      guest_email: s.guest_email,
      status: s.status,
      order_date: s.order_date,
      farm_subtotal: s.farm_subtotal,
      special_instructions: detail?.special_instructions ?? null,
      order_items: items,
    };
  });

  return <OrderList orders={orders} />;
}
