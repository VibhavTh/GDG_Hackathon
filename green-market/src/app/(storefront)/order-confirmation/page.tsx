import { createServiceClient } from "@/lib/supabase/server";
import { ConfirmationContent, type Order } from "./confirmation-content";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return <NotFound />;
  }

  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      total_amount,
      guest_email,
      special_instructions,
      created_at,
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
    .eq("stripe_session_id", session_id)
    .single();

  if (!order) {
    return <NotFound />;
  }

  return <ConfirmationContent order={order as unknown as Order} />;
}

function NotFound() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-6">
        <Icon name="search_off" className="text-on-surface-variant" />
      </div>
      <h1 className="font-headline text-3xl text-tertiary mb-3">Order Not Found</h1>
      <p className="text-on-surface-variant max-w-sm mb-8">
        We couldn&rsquo;t find your order. It may still be processing — check your email for a confirmation.
      </p>
      <Link
        href="/order-lookup"
        className="font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1"
      >
        Track Your Order <Icon name="arrow_forward" size="sm" />
      </Link>
    </main>
  );
}
