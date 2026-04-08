-- ============================================================
-- Schema patches -- run in Supabase SQL Editor
-- ============================================================

-- Add missing columns to products
alter table public.products add column if not exists unit text default 'each';

-- Add missing columns to orders
alter table public.orders add column if not exists stripe_session_id text;
alter table public.orders add column if not exists stripe_payment_intent text;

-- Make sure order status enum includes all needed values
-- (placed is the initial status now, not pending_payment)
-- No change needed if the enum already has: placed, confirmed, preparing, ready, fulfilled, cancelled, failed, abandoned


-- ============================================================
-- confirm_order RPC -- called by Stripe webhook after payment
-- Atomically: marks order confirmed, decrements stock, records webhook
-- ============================================================
create or replace function public.confirm_order(
  p_event_id text,
  p_order_id uuid,
  p_payment_intent_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
begin
  -- Idempotency: skip if already processed
  if exists (select 1 from processed_webhooks where stripe_event_id = p_event_id) then
    return;
  end if;

  -- Update order status to confirmed and store payment intent
  update orders
  set status = 'confirmed',
      stripe_payment_intent = p_payment_intent_id,
      updated_at = now()
  where id = p_order_id
    and status = 'placed';

  if not found then
    -- Order already confirmed, cancelled, or doesn't exist
    return;
  end if;

  -- Decrement stock for each item
  for v_item in
    select product_id, quantity
    from order_items
    where order_id = p_order_id
  loop
    update products
    set stock = greatest(stock - v_item.quantity, 0),
        updated_at = now()
    where id = v_item.product_id;
  end loop;

  -- Record webhook as processed
  insert into processed_webhooks (stripe_event_id)
  values (p_event_id)
  on conflict do nothing;
end;
$$;
