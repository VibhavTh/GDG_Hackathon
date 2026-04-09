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


-- ============================================================
-- Phase 2: Stripe Connect columns
-- ============================================================

-- Farms: Connect onboarding state
alter table public.farms
  add column if not exists stripe_onboarding_complete boolean not null default false;

alter table public.farms
  add column if not exists payouts_enabled boolean not null default false;

-- Orders: platform fee (transfer tracking moved to farm_transfers table)
alter table public.orders
  drop column if exists stripe_transfer_id;

alter table public.orders
  add column if not exists platform_fee_cents integer not null default 0;

-- ============================================================
-- Phase 2b: Multi-farm transfer tracking
-- ============================================================

create table if not exists public.farm_transfers (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  farm_id uuid not null references public.farms(id),
  stripe_account_id text not null,
  amount_cents integer not null,
  platform_fee_cents integer not null default 0,
  stripe_transfer_id text,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'reversed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_farm_transfers_order on public.farm_transfers(order_id);
create index if not exists idx_farm_transfers_farm on public.farm_transfers(farm_id);
