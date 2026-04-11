-- ============================================================
-- Schema patches -- run in Supabase SQL Editor
-- Single-vendor: no farms table, no farm_transfers, no Connect.
-- ============================================================

-- Add missing columns to products
alter table public.products add column if not exists unit text default 'each';

-- Add missing columns to orders
alter table public.orders add column if not exists stripe_session_id text;
alter table public.orders add column if not exists stripe_payment_intent text;
alter table public.orders add column if not exists customer_phone text;

-- Order number (human-readable, generated from id prefix)
alter table public.orders add column if not exists order_number text;


-- ============================================================
-- site_settings -- single row for farm identity
-- ============================================================
create table if not exists public.site_settings (
  id int primary key check (id = 1),
  name text not null,
  description text,
  location text,
  image_url text,
  categories public.product_category[] default '{}',
  instagram_url text,
  updated_at timestamptz default now()
);

-- Seed default row
insert into public.site_settings (id, name, description, location)
values (
  1,
  'The Green Market Farm',
  'Fresh, seasonal produce grown on our Blacksburg farm and delivered straight to your table.',
  'Blacksburg, VA'
)
on conflict (id) do nothing;


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
