-- ============================================================
-- RLS Policies — run in Supabase SQL Editor
-- ============================================================

-- ---- users ----
alter table public.users enable row level security;

-- Users can read their own row
create policy "users: read own row"
  on public.users for select
  using (auth.uid() = id);

-- Users can update their own row (name, avatar, etc.)
create policy "users: update own row"
  on public.users for update
  using (auth.uid() = id);

-- Service role handles inserts (register action + trigger)
-- No insert policy needed for anon/authenticated — service role bypasses RLS


-- ---- farms ----
alter table public.farms enable row level security;

-- Anyone (including guests) can read farms — needed for storefront
create policy "farms: public read"
  on public.farms for select
  using (true);

-- Only the farm owner can update their farm
create policy "farms: owner update"
  on public.farms for update
  using (auth.uid() = owner_id);

-- Service role handles inserts
-- No insert policy needed for anon/authenticated


-- ---- products ----
alter table public.products enable row level security;

-- Anyone can read active, non-deleted products (storefront)
create policy "products: public read active"
  on public.products for select
  using (
    is_active = true
    and deleted_at is null
  );

-- Farm owners can read ALL their products (including inactive/deleted — for inventory)
create policy "products: owner read all"
  on public.products for select
  using (
    farm_id in (
      select id from public.farms where owner_id = auth.uid()
    )
  );

-- Farm owners can insert products for their farm
create policy "products: owner insert"
  on public.products for insert
  with check (
    farm_id in (
      select id from public.farms where owner_id = auth.uid()
    )
  );

-- Farm owners can update their own products
create policy "products: owner update"
  on public.products for update
  using (
    farm_id in (
      select id from public.farms where owner_id = auth.uid()
    )
  );

-- Farm owners can delete (hard delete) their own products
-- Soft delete is handled via update (deleted_at), so this is a safety net
create policy "products: owner delete"
  on public.products for delete
  using (
    farm_id in (
      select id from public.farms where owner_id = auth.uid()
    )
  );


-- ---- orders ----
alter table public.orders enable row level security;

-- Customers can read their own orders
create policy "orders: customer read own"
  on public.orders for select
  using (
    customer_id = auth.uid()
  );

-- Farm owners can read orders that contain their products
create policy "orders: farm owner read"
  on public.orders for select
  using (
    id in (
      select oi.order_id
      from public.order_items oi
      join public.products p on p.id = oi.product_id
      join public.farms f on f.id = p.farm_id
      where f.owner_id = auth.uid()
    )
  );

-- Farm owners can update status on orders that contain their products
create policy "orders: farm owner update"
  on public.orders for update
  using (
    id in (
      select oi.order_id
      from public.order_items oi
      join public.products p on p.id = oi.product_id
      join public.farms f on f.id = p.farm_id
      where f.owner_id = auth.uid()
    )
  );

-- Authenticated customers can place orders; guests handled via service role
create policy "orders: authenticated insert"
  on public.orders for insert
  with check (
    customer_id = auth.uid()
    or customer_id is null
  );


-- ---- order_items ----
alter table public.order_items enable row level security;

-- Readable if you own the order or the product belongs to your farm
create policy "order_items: readable with order"
  on public.order_items for select
  using (
    order_id in (
      select id from public.orders where customer_id = auth.uid()
    )
    or product_id in (
      select p.id from public.products p
      join public.farms f on f.id = p.farm_id
      where f.owner_id = auth.uid()
    )
  );

-- Insert allowed when placing an order you own
create policy "order_items: insert with order"
  on public.order_items for insert
  with check (
    order_id in (
      select id from public.orders
      where customer_id = auth.uid()
         or customer_id is null
    )
  );


-- ---- processed_webhooks ----
alter table public.processed_webhooks enable row level security;
-- Only service role can touch this table — no policies needed for anon/authenticated
